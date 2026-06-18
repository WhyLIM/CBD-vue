const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();
const { lookupEdges } = require('../src/stringIndex');

// Python 解释器（可通过环境变量覆盖，否则用系统默认 python）
const PYTHON_BIN = process.env.PYTHON_BIN || 'python';
// 包装脚本路径
const PRS_SCRIPT = path.join(__dirname, '..', 'scripts', 'prs_compute.py');
// 子进程超时（毫秒）
const TIMEOUT_MS = 30000;
// 请求体大小上限（字节）
const MAX_PAYLOAD = 2 * 1024 * 1024; // 2MB
// STRING 阈值（在索引阈值 400 基础上可再提高，用于 Custom 模式过滤）
const STRING_SCORE_THRESHOLD = parseInt(process.env.STRING_SCORE_THRESHOLD || '400', 10);
// 基因列表输入上限
const MAX_GENES = 500;
// 子网络所需最少基因数
const MIN_GENES = 2;

// 简易 LRU 缓存：相同输入指纹的请求直接返回结果
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 小时
const CACHE_MAX = 50;
const cache = new Map(); // key -> { value, ts }

function fingerprint(payload) {
    const h = crypto.createHash('sha1');
    h.update(JSON.stringify(payload));
    return h.digest('hex');
}

function cacheGet(key) {
    const e = cache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    cache.delete(key);
    cache.set(key, e);
    return e.value;
}

function cacheSet(key, value) {
    if (cache.size >= CACHE_MAX) {
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, { value, ts: Date.now() });
}

function runPrsScript(payload) {
    return new Promise((resolve, reject) => {
        const body = Buffer.from(JSON.stringify(payload));
        const proc = spawn(PYTHON_BIN, [PRS_SCRIPT], {
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
        });

        let stdout = '';
        let stderr = '';
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                try { proc.kill('SIGKILL'); } catch (_) {}
                reject(new Error('Python 计算超时'));
            }
        }, TIMEOUT_MS);

        proc.stdout.on('data', (d) => { stdout += d.toString(); });
        proc.stderr.on('data', (d) => { stderr += d.toString(); });

        proc.on('error', (err) => {
            if (!settled) {
                settled = true;
                clearTimeout(timer);
                reject(new Error(`无法启动 Python 子进程: ${err.message}`));
            }
        });

        proc.on('close', (code) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (code !== 0) {
                return reject(new Error(`Python 退出码 ${code}: ${stderr.slice(0, 500)}`));
            }
            try {
                const out = JSON.parse(stdout);
                if (!out.success) {
                    return reject(new Error(out.error || 'PRS 计算失败'));
                }
                resolve(out.data);
            } catch (e) {
                reject(new Error(`解析 Python 输出失败: ${e.message}`));
            }
        });

        proc.stdin.write(body);
        proc.stdin.end();
    });
}

// 校验 edges 输入并提取节点数
function validateEdges(edges) {
    if (!Array.isArray(edges) || edges.length === 0) {
        const err = new Error('edges 必须是非空数组');
        err.code = 'BAD_INPUT';
        throw err;
    }
    const nodeSet = new Set();
    for (const e of edges) {
        if (!Array.isArray(e) || e.length !== 2) continue;
        nodeSet.add(String(e[0])); nodeSet.add(String(e[1]));
    }
    if (nodeSet.size > 500) {
        const err = new Error(`节点数 ${nodeSet.size} 超过上限 500`);
        err.code = 'NODE_LIMIT';
        throw err;
    }
    return nodeSet.size;
}

// POST /api/network/prs
// 直接提交边列表：body { edges: [[g1,g2], ...], cluster?: boolean }
// 保留供有自定义边数据的场景使用。
router.post('/prs', async (req, res) => {
    try {
        const { edges, cluster = false } = req.body || {};

        const approxSize = JSON.stringify(req.body).length;
        if (approxSize > MAX_PAYLOAD) {
            return res.status(413).json({
                success: false,
                error: `请求体过大（${(approxSize / 1024).toFixed(0)} KB > ${(MAX_PAYLOAD / 1024).toFixed(0)} KB）`
            });
        }
        try { validateEdges(edges); }
        catch (e) {
            return res.status(400).json({ success: false, error: e.message });
        }

        const key = fingerprint({ edges, cluster });
        const cached = cacheGet(key);
        if (cached) return res.json({ success: true, data: cached, cached: true });

        const data = await runPrsScript({ edges, cluster });
        cacheSet(key, data);
        res.json({ success: true, data, cached: false });
    } catch (e) {
        console.error('network/prs error:', e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

// POST /api/network/prs/genes
// 按基因列表输入：body { genes: ['TP53','MDM2',...], cluster?: boolean, threshold?: number }
// 内部流程：STRING 索引查边 → 调 prs_compute.py 算 PRS
router.post('/prs/genes', async (req, res) => {
    try {
        const { genes, cluster = false, threshold = STRING_SCORE_THRESHOLD } = req.body || {};

        // 校验基因列表
        if (!Array.isArray(genes) || genes.length < MIN_GENES) {
            return res.status(400).json({
                success: false,
                error: `genes 必须是至少 ${MIN_GENES} 个基因的数组`
            });
        }
        // 清洗 + 大小写标准化
        const cleanGenes = [];
        const seen = new Set();
        for (const g of genes) {
            const s = String(g).trim().toUpperCase();
            if (!s) continue;
            if (seen.has(s)) continue;
            seen.add(s);
            cleanGenes.push(s);
        }
        if (cleanGenes.length < MIN_GENES) {
            return res.status(400).json({
                success: false,
                error: `清洗后有效基因数不足 ${MIN_GENES}（请检查输入）`
            });
        }
        if (cleanGenes.length > MAX_GENES) {
            return res.status(400).json({
                success: false,
                error: `基因数 ${cleanGenes.length} 超过上限 ${MAX_GENES}`
            });
        }

        const key = fingerprint({ genes: cleanGenes, cluster, threshold });
        const cached = cacheGet(key);
        if (cached) return res.json({ success: true, data: cached, cached: true });

        // 1. STRING 索引查边
        const lookup = await lookupEdges(cleanGenes, threshold);
        if (lookup.edges.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'STRING 在给定阈值下未找到任何边。可降低 threshold 或检查基因名拼写。',
                meta: {
                    inputCount: lookup.inputCount,
                    resolvedCount: lookup.resolvedCount,
                    unresolved: lookup.unresolved,
                }
            });
        }

        // 2. 调 PRS 计算（边格式：[[g1, g2], ...]）
        const edges = lookup.edges.map(([a, b]) => [a, b]);
        let data;
        try {
            data = await runPrsScript({ edges, cluster });
        } catch (e) {
            return res.status(500).json({
                success: false,
                error: e.message,
                meta: {
                    inputCount: lookup.inputCount,
                    resolvedCount: lookup.resolvedCount,
                    unresolved: lookup.unresolved,
                    edgeCount: lookup.edges.length,
                }
            });
        }

        // 附加 STRING 解析元数据，便于前端提示
        data.meta = {
            inputCount: lookup.inputCount,
            resolvedCount: lookup.resolvedCount,
            unresolved: lookup.unresolved,
            edgeCount: lookup.edges.length,
            threshold,
        };

        cacheSet(key, data);
        res.json({ success: true, data, cached: false });
    } catch (e) {
        console.error('network/prs/genes error:', e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
