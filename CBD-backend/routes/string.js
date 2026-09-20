const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { loadIndex } = require('../src/stringIndex');

const PRIMARY_BASE = process.env.STRING_BASE || 'https://string-db.org/api'
const commonHeaders = {
    'User-Agent': 'curl/8.7.1',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Accept-Encoding': 'gzip, deflate, br'
}
let cachedStableBase = null
let cachedAt = 0
const CACHE_TTL_MS = 60 * 60 * 1000

// 全局限流(100次/15分钟)对本路由跳过（见 server.js），这里单独放宽：
// 一次完整的网络分析（resolve + network + stats + enrichment + expand + 模块富集）就会产生 6-10 个请求
router.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many STRING requests from this IP, please try again later.' }
}));

// 本地索引相关上限
const MAX_INPUT = 200          // expand/resolve 单次输入蛋白上限
const MAX_PARTNERS = 20        // expand 每个蛋白最多扩展的一阶邻居数
const MAX_SEEDS = 100          // proximity 种子基因上限
const MAX_PERMUTATIONS = 1000  // proximity 最大置换次数

// 简易 LRU 缓存（与 routes/network.js 相同模式），用于 proximity 等本地重计算
const LRW_TTL_MS = 60 * 60 * 1000
const LRU_MAX = 50
const computeCache = new Map()

function fingerprint(payload) {
    return crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex')
}

function cacheGet(key) {
    const e = computeCache.get(key)
    if (!e) return null
    if (Date.now() - e.ts > LRW_TTL_MS) {
        computeCache.delete(key)
        return null
    }
    computeCache.delete(key)
    computeCache.set(key, e)
    return e.value
}

function cacheSet(key, value) {
    if (computeCache.size >= LRU_MAX) {
        computeCache.delete(computeCache.keys().next().value)
    }
    computeCache.set(key, { value, ts: Date.now() })
}

async function requestString(base, path, params, responseType = 'json') {
    const url = `${base}${path}`
    return axios.get(url, {
        params,
        timeout: 30000,
        maxRedirects: 3,
        responseType,
        headers: {
            ...commonHeaders,
            Host: new URL(base).host
        }
    })
}

async function getStableBase() {
    const now = Date.now()
    if (cachedStableBase && (now - cachedAt) < CACHE_TTL_MS) return cachedStableBase
    try {
        const ver = await requestString(PRIMARY_BASE, '/json/version', {}, 'json')
        const addr = Array.isArray(ver.data) && ver.data[0]?.stable_address
        if (addr && typeof addr === 'string') {
            cachedStableBase = `${addr}/api`
            cachedAt = now
            return cachedStableBase
        }
    } catch {
        // ignore and fallback to primary
    }
    return PRIMARY_BASE
}

// 代理 STRING API 网络请求
router.post('/network', async (req, res) => {
    try {
        const { identifiers, species = '9606', required_score = 400, network_type = 'functional' } = req.body;

        if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
            return res.status(400).json({
                error: 'Invalid identifiers',
                message: 'Identifiers must be a non-empty array'
            });
        }

        const identifierString = identifiers
            .map(v => String(v).trim())
            .filter(v => v.length > 0)
            .join('%0d');
        const params = {
            identifiers: identifierString,
            species,
            required_score,
            network_type
        };

        const base = await getStableBase()
        const response = await requestString(base, '/json/network', params, 'json')

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('STRING network API proxy error:', error);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch network data',
            message: error.response?.data?.message || error.message
        });
    }
});

// 代理 STRING API 网络统计请求
router.post('/stats', async (req, res) => {
    try {
        const { identifiers, species = '9606' } = req.body;

        if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
            return res.status(400).json({
                error: 'Invalid identifiers',
                message: 'Identifiers must be a non-empty array'
            });
        }

        const identifierString = identifiers
            .map(v => String(v).trim())
            .filter(v => v.length > 0)
            .join('%0d');
        const params = {
            identifiers: identifierString,
            species
        };

        const base = await getStableBase()
        const response = await requestString(base, '/json/ppi_enrichment', params, 'json')

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('STRING stats API proxy error:', error);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch stats data',
            message: error.response?.data?.message || error.message
        });
    }
});

// 代理 STRING API 富集分析请求
router.post('/enrichment', async (req, res) => {
    try {
        const { identifiers, species = '9606' } = req.body;

        if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
            return res.status(400).json({
                error: 'Invalid identifiers',
                message: 'Identifiers must be a non-empty array'
            });
        }

        const identifierString = identifiers
            .map(v => String(v).trim())
            .filter(v => v.length > 0)
            .join('%0d');
        const params = {
            identifiers: identifierString,
            species
        };

        const base = await getStableBase()
        const response = await requestString(base, '/json/enrichment', params, 'json')

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('STRING enrichment API proxy error:', error);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch enrichment data',
            message: error.response?.data?.message || error.message
        });
    }
});

// 输入蛋白 ID 解析/映射报告（返回 queryIndex/queryItem 回显，未匹配的输入会被 STRING 静默忽略）
router.post('/resolve', async (req, res) => {
    try {
        const { identifiers, species = '9606' } = req.body;

        if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
            return res.status(400).json({
                error: 'Invalid identifiers',
                message: 'Identifiers must be a non-empty array'
            });
        }
        if (identifiers.length > MAX_INPUT) {
            return res.status(400).json({
                error: 'Too many identifiers',
                message: `At most ${MAX_INPUT} identifiers per request`
            });
        }

        const identifierString = identifiers
            .map(v => String(v).trim())
            .filter(v => v.length > 0)
            .join('%0d');

        const base = await getStableBase()
        const response = await requestString(base, '/json/get_string_ids', {
            identifiers: identifierString,
            species,
            limit: 1
        }, 'json')

        const rows = Array.isArray(response.data) ? response.data : []
        const mappings = rows.map(r => ({
            queryIndex: r.queryIndex,
            query: r.queryItem,
            stringId: r.stringId,
            preferredName: r.preferredName,
            annotation: r.annotation || ''
        }))
        const matchedQueries = new Set(mappings.map(m => String(m.query).trim().toUpperCase()))
        const unmatched = identifiers
            .map(v => String(v).trim())
            .filter((v, i, arr) => v && arr.indexOf(v) === i)
            .filter(v => !matchedQueries.has(v.toUpperCase()))

        res.json({
            success: true,
            data: { mappings, unmatched, requested: identifiers.length, matched: mappings.length }
        });

    } catch (error) {
        console.error('STRING resolve proxy error:', error);
        res.status(error.response?.status || 500).json({
            error: 'Failed to resolve identifiers',
            message: error.response?.data?.message || error.message
        });
    }
});

// 一阶邻居扩展：人源且阈值>=400 时走本地索引（秒回、不受上游网络影响），
// 其他情况回退 STRING interaction_partners + network 两步取带分数的完整边集
router.post('/expand', async (req, res) => {
    try {
        const { identifiers, species = '9606', add_partners = 10, required_score = 400, network_type = 'functional' } = req.body;

        if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
            return res.status(400).json({
                error: 'Invalid identifiers',
                message: 'Identifiers must be a non-empty array'
            });
        }
        if (identifiers.length > MAX_INPUT) {
            return res.status(400).json({
                error: 'Too many identifiers',
                message: `At most ${MAX_INPUT} identifiers per request`
            });
        }
        const partners = Math.min(Math.max(parseInt(add_partners, 10) || 0, 1), MAX_PARTNERS);
        const score = Math.min(Math.max(parseInt(required_score, 10) || 400, 0), 1000);
        const input = identifiers.map(v => String(v).trim()).filter(v => v.length > 0);

        let rows;
        let addedPartners = [];
        let unresolved = [];
        let source;

        if (String(species) === '9606' && score >= 400) {
            // 本地索引路径
            const { adjacency } = await loadIndex();
            const inputSet = new Set(input.map(g => g.toUpperCase()));
            const partnerSet = new Set();

            for (const geneRaw of input) {
                const gene = geneRaw.toUpperCase();
                const neighbors = adjacency.get(gene);
                if (!neighbors) {
                    unresolved.push(geneRaw);
                    continue;
                }
                const candidates = neighbors
                    .filter(([n, s]) => s >= score && !inputSet.has(n))
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, partners);
                for (const [n] of candidates) partnerSet.add(n);
            }

            addedPartners = [...partnerSet];
            const combinedSet = new Set([...inputSet, ...partnerSet]);
            const edgeSeen = new Set();
            rows = [];
            for (const gene of combinedSet) {
                const neighbors = adjacency.get(gene);
                if (!neighbors) continue;
                for (const [other, s] of neighbors) {
                    if (s < score || !combinedSet.has(other)) continue;
                    const key = gene < other ? `${gene}|${other}` : `${other}|${gene}`;
                    if (edgeSeen.has(key)) continue;
                    edgeSeen.add(key);
                    rows.push({
                        stringId_A: `9606.${gene}`,
                        stringId_B: `9606.${other}`,
                        preferredName_A: gene < other ? gene : other,
                        preferredName_B: gene < other ? other : gene,
                        ncbiTaxonId: 9606,
                        score: s / 1000
                    });
                }
            }
            source = 'local_index';
        } else {
            // 上游两步：interaction_partners 取伙伴 -> network 取合并集合的带分数边
            const base = await getStableBase();
            const identifierString = input.join('%0d');
            const ipResponse = await requestString(base, '/json/interaction_partners', {
                identifiers: identifierString,
                species,
                limit: partners
            }, 'json');
            const ipRows = Array.isArray(ipResponse.data) ? ipResponse.data : [];
            const inputUpper = new Set(input.map(g => g.toUpperCase()));
            for (const r of ipRows) {
                for (const name of [r.preferredName_A, r.preferredName_B]) {
                    if (name && !inputUpper.has(String(name).toUpperCase())) partnerSet.add(String(name));
                }
            }
            addedPartners = [...partnerSet];
            const combinedIds = [...input, ...addedPartners];
            if (combinedIds.length > 0) {
                const netResponse = await requestString(base, '/json/network', {
                    identifiers: combinedIds.join('%0d'),
                    species,
                    required_score: score,
                    network_type
                }, 'json');
                rows = Array.isArray(netResponse.data) ? netResponse.data : [];
            } else {
                rows = [];
            }
            source = 'string_api';
        }

        res.json({
            success: true,
            data: {
                rows,
                added_partners: addedPartners,
                unresolved,
                source,
                input_count: input.length,
                partner_count: addedPartners.length
            }
        });

    } catch (error) {
        console.error('STRING expand error:', error);
        res.status(error.response?.status || 500).json({
            error: 'Failed to expand network',
            message: error.response?.data?.message || error.message
        });
    }
});

// 边的支撑文献：Europe PMC 检索两基因在标题/摘要中共现的论文（STRING v12 API 已移除 abstract_pubmeds）
router.post('/abstracts', async (req, res) => {
    try {
        const { identifiers } = req.body;

        if (!identifiers || !Array.isArray(identifiers) || identifiers.length !== 2) {
            return res.status(400).json({
                error: 'Invalid identifiers',
                message: 'Exactly two protein names are required'
            });
        }
        const [a, b] = identifiers.map(v => String(v).trim()).filter(v => v.length > 0);
        if (!a || !b) {
            return res.status(400).json({ error: 'Invalid identifiers', message: 'Both protein names are required' });
        }

        const query = `("${a}" AND "${b}")[TITLE/ABSTRACT]`;
        const response = await axios.get('https://www.ebi.ac.uk/europepmc/webservices/rest/search', {
            params: { query, format: 'json', pageSize: 8, resultType: 'lite' },
            timeout: 15000
        });
        const results = response.data?.resultList?.result || [];
        const publications = results
            .filter(r => r.source === 'MED' && r.id)
            .map(r => ({
                pmid: r.id,
                title: (r.title || '').replace(/\s*\[.*?\]\s*$/, '').trim(),
                journal: r.journalTitle || r.bookOrReportDetails?.publisher || '',
                year: r.pubYear || '',
                doi: r.doi || ''
            }));

        res.json({
            success: true,
            data: { publications, hitCount: response.data?.hitCount || 0 }
        });

    } catch (error) {
        console.error('Europe PMC abstracts error:', error);
        // 文献检索属增强功能，上游不可用时返回空集而不是 500，避免打断交互
        res.json({ success: true, data: { publications: [], hitCount: 0, note: 'Literature service temporarily unavailable' } });
    }
});

// 蛋白功能注释（STRING functional_annotation，行数可能很多，由前端分组展示）
router.post('/annotations', async (req, res) => {
    try {
        const { identifiers, species = '9606' } = req.body;

        if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
            return res.status(400).json({
                error: 'Invalid identifiers',
                message: 'Identifiers must be a non-empty array'
            });
        }

        const identifierString = identifiers
            .map(v => String(v).trim())
            .filter(v => v.length > 0)
            .join('%0d');

        const base = await getStableBase()
        const response = await requestString(base, '/json/functional_annotation', {
            identifiers: identifierString,
            species
        }, 'json')

        res.json({
            success: true,
            data: Array.isArray(response.data) ? response.data : []
        });

    } catch (error) {
        console.error('STRING annotations proxy error:', error);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch annotations',
            message: error.response?.data?.message || error.message
        });
    }
});

// STRING 支持的物种列表（本地静态文件，来自 STRING downloads 的 species 信息裁剪）
let speciesCache = null;
router.get('/species', (req, res) => {
    try {
        if (!speciesCache) {
            const file = path.join(__dirname, '..', 'data', 'string_species.json');
            speciesCache = JSON.parse(fs.readFileSync(file, 'utf8'));
        }
        res.json({ success: true, data: speciesCache });
    } catch (error) {
        console.error('STRING species list error:', error);
        res.status(500).json({
            error: 'Failed to load species list',
            message: 'data/string_species.json missing or invalid'
        });
    }
});

// 索引图的静态派生结构（节点索引、无权邻接表、度表、边集合）。
// 索引本身经 loadIndex 记忆化且不可变，这里同样只构建一次，避免每次请求
// 重建 ~46 万条边的 edgeKeys（约 30MB 临时开销）。
let graphContextCache = null;

async function getGraphContext() {
    if (graphContextCache) return graphContextCache;
    const { adjacency } = await loadIndex();

    const nodeIdx = new Map();
    const nodes = [];
    const addNode = (name) => {
        if (!nodeIdx.has(name)) {
            nodeIdx.set(name, nodes.length);
            nodes.push(name);
        }
        return nodeIdx.get(name);
    };
    const rawAdj = []; // idx -> [[neighborName, score], ...]
    for (const [gene, neighbors] of adjacency) {
        const gi = addNode(gene);
        rawAdj[gi] = neighbors;
        for (const [n] of neighbors) addNode(n);
    }
    const V = nodes.length;
    const adjList = new Array(V);
    for (let i = 0; i < V; i++) {
        const list = rawAdj[i];
        if (!list) { adjList[i] = []; continue; }
        const arr = new Int32Array(list.length);
        for (let j = 0; j < list.length; j++) arr[j] = nodeIdx.get(list[j][0]);
        adjList[i] = arr;
    }
    const degreeOf = new Int32Array(V);
    for (let i = 0; i < V; i++) degreeOf[i] = adjList[i].length;

    // 度 -> 同度节点列表（用于度匹配抽样）
    const byDegree = new Map();
    for (let i = 0; i < V; i++) {
        const d = degreeOf[i];
        if (!byDegree.has(d)) byDegree.set(d, []);
        byDegree.get(d).push(i);
    }

    // 无向边集合（数值键：min*V+max），用于诱导子图连边计数
    const edgeKeys = new Set();
    for (let i = 0; i < V; i++) {
        for (const v of adjList[i]) {
            edgeKeys.add(i < v ? i * V + v : v * V + i);
        }
    }

    graphContextCache = { nodeIdx, nodes, adjList, degreeOf, byDegree, edgeKeys, V };
    return graphContextCache;
}

/**
 * 标志物集邻近性检验（Menche 邻近性框架，本地人源索引）。
 *
 * 步骤：
 * 1. 在索引图（combined_score>=400 的无权图）上从每个种子 BFS，预计算距离向量；
 * 2. 观测 proximity = mean_a min_b d(a,b)，a 为种子、b 为同一随机集；
 * 3. 度匹配随机化：每个种子从相同度的基因中随机抽一个组成随机集 B，重复 R 次；
 * 4. 输出 z-score 与经验 p 值（随机 <= 观测 的比例，越接近 0 表示种子集在网络
 *    上比随机更聚集）。
 */
router.post('/proximity', async (req, res) => {
    const started = Date.now();
    try {
        const { seeds, permutations = 500, random_seed = 42 } = req.body;

        if (!seeds || !Array.isArray(seeds) || seeds.length < 2) {
            return res.status(400).json({
                error: 'Invalid seeds',
                message: 'At least two seed genes are required'
            });
        }
        if (seeds.length > MAX_SEEDS) {
            return res.status(400).json({
                error: 'Too many seeds',
                message: `At most ${MAX_SEEDS} seeds per request`
            });
        }
        const R = Math.min(Math.max(parseInt(permutations, 10) || 500, 50), MAX_PERMUTATIONS);

        const seedList = [...new Set(seeds.map(v => String(v).trim().toUpperCase()).filter(v => v))];

        const key = fingerprint({ op: 'proximity', seeds: [...seedList].sort(), permutations: R });
        const cached = cacheGet(key);
        if (cached) {
            return res.json({ success: true, data: { ...cached, cached: true } });
        }

        const { nodeIdx, adjList, degreeOf, byDegree, edgeKeys, V } = await getGraphContext();

        // 解析种子
        const seedIdx = [];
        const unresolved = [];
        for (const s of seedList) {
            const idx = nodeIdx.get(s);
            if (idx === undefined) unresolved.push(s);
            else seedIdx.push(idx);
        }
        if (seedIdx.length < 2) {
            return res.status(400).json({
                error: 'Not enough resolved seeds',
                message: `Only ${seedIdx.length} of ${seedList.length} seeds exist in the local human STRING index (combined_score >= 400)`,
                data_unresolved: unresolved
            });
        }

        // 每个种子一次 BFS，得到距离向量（-1 表示不可达）；以节点索引为键存储
        const S = seedIdx.length;
        const distByNode = new Map();
        const queue = new Int32Array(V);
        for (let si = 0; si < S; si++) {
            const d = new Int32Array(V).fill(-1);
            let head = 0, tail = 0;
            d[seedIdx[si]] = 0;
            queue[tail++] = seedIdx[si];
            while (head < tail) {
                const u = queue[head++];
                for (let k = 0; k < adjList[u].length; k++) {
                    const v = adjList[u][k];
                    if (d[v] === -1) {
                        d[v] = d[u] + 1;
                        queue[tail++] = v;
                    }
                }
            }
            distByNode.set(seedIdx[si], d);
        }

        // 简单可复现随机数（mulberry32）
        let rngState = (parseInt(random_seed, 10) || 42) >>> 0;
        const rand = () => {
            rngState |= 0; rngState = (rngState + 0x6D2B79F5) | 0;
            let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };

        // proximity(A, B)：mean over seeds of min distance to B（排除自身与不可达对）
        const proximity = (seedIndices, bNodes) => {
            let sum = 0, count = 0;
            for (const a of seedIndices) {
                const d = distByNode.get(a);
                let best = Infinity;
                for (const b of bNodes) {
                    if (b === a) continue;
                    const v = d[b];
                    if (v >= 0 && v < best) best = v;
                }
                if (best !== Infinity) { sum += best; count++; }
            }
            return count > 0 ? sum / count : null;
        };

        // 度匹配随机集
        const randomSet = () => {
            const b = [];
            for (const a of seedIdx) {
                const candidates = byDegree.get(degreeOf[a]);
                b.push(candidates[Math.floor(rand() * candidates.length)]);
            }
            return b;
        };

        // 诱导子图内部连边数（小种子集下比最短距离统计更灵敏）
        const internalEdges = (nodeArr) => {
            let c = 0;
            for (let i = 0; i < nodeArr.length; i++) {
                for (let j = i + 1; j < nodeArr.length; j++) {
                    const x = nodeArr[i], y = nodeArr[j];
                    if (x !== y && edgeKeys.has(x < y ? x * V + y : y * V + x)) c++;
                }
            }
            return c;
        };

        const observed = proximity(seedIdx, seedIdx);
        const observedEdges = internalEdges(seedIdx);
        const values = [];
        const edgeValues = [];
        for (let r = 0; r < R; r++) {
            const b = randomSet();
            const p = proximity(seedIdx, b);
            if (p !== null) values.push(p);
            edgeValues.push(internalEdges(b));
        }
        const n = values.length;
        const mean = values.reduce((s, v) => s + v, 0) / n;
        const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1));
        const lessOrEqual = values.filter(v => v <= observed).length;
        const pValue = (lessOrEqual + 1) / (n + 1);
        const zScore = sd > 0 ? (mean - observed) / sd : 0;

        // 凝聚度（内部连边）统计
        const m = edgeValues.length;
        const eMean = edgeValues.reduce((s, v) => s + v, 0) / m;
        const eSd = Math.sqrt(edgeValues.reduce((s, v) => s + (v - eMean) ** 2, 0) / (m - 1));
        const greaterOrEqual = edgeValues.filter(v => v >= observedEdges).length;
        const ePValue = (greaterOrEqual + 1) / (m + 1);
        const eZScore = eSd > 0 ? (observedEdges - eMean) / eSd : 0;

        const data = {
            observed,
            random_mean: mean,
            random_sd: sd,
            z_score: Number(zScore.toFixed(4)),
            p_value: Number(pValue.toFixed(5)),
            cohesion: {
                observed_edges: observedEdges,
                random_mean: Number(eMean.toFixed(3)),
                random_sd: Number(eSd.toFixed(3)),
                z_score: Number(eZScore.toFixed(4)),
                p_value: Number(ePValue.toFixed(5))
            },
            permutations: n,
            seed_count: S,
            unresolved,
            excluded_seeds: seedList.length - S,
            graph: {
                nodes: V,
                edges: adjList.reduce((s, a) => s + a.length, 0) / 2,
                score_threshold: 400
            },
            distribution: values.map(v => Number(v.toFixed(6))),
            cohesion_distribution: edgeValues,
            runtime_ms: Date.now() - started
        };
        cacheSet(key, data);
        res.json({ success: true, data });

    } catch (error) {
        console.error('STRING proximity error:', error);
        res.status(500).json({
            error: 'Failed to compute proximity',
            message: error.message
        });
    }
});

// 获取 STRING 版本信息
router.get('/version', async (req, res) => {
    try {
        const base = await getStableBase()
        const response = await requestString(base, '/json/version', {}, 'json')

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('STRING version API proxy error:', error);
        res.status(500).json({
            error: 'Failed to fetch version info',
            message: error.response?.data?.message || error.message
        });
    }
});

// 移除 TSV 解析，统一使用 JSON 接口

module.exports = router;
