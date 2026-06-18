/**
 * STRING 本地索引服务模块。
 *
 * 懒加载 scripts/build_string_index.js 生成的 JSON 邻接表，
 * 提供 lookupEdges(genes) 用于把基因列表解析为 STRING 子网络的边集合。
 *
 * 依赖文件：CBD-backend/data/string_index.json
 * 若文件不存在，调用方应提示运行 `node scripts/build_string_index.js`。
 */
const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '..', 'data', 'string_index.json');
const DEFAULT_THRESHOLD = 400;

let indexCache = null; // { adjacency: Map<string, Array<[string, number]>> }
let loadPromise = null;

async function loadIndex() {
  if (indexCache) return indexCache;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    if (!fs.existsSync(INDEX_FILE)) {
      const msg = `STRING 索引不存在: ${INDEX_FILE}。请在 CBD-backend 目录运行: node scripts/build_string_index.js`;
      throw new Error(msg);
    }
    const raw = fs.readFileSync(INDEX_FILE, 'utf8');
    const obj = JSON.parse(raw);
    const adjacency = new Map();
    for (const k of Object.keys(obj)) {
      adjacency.set(k, obj[k]);
    }
    indexCache = { adjacency };
    console.log(`[stringIndex] 已加载 STRING 索引: ${adjacency.size} 个基因`);
    return indexCache;
  })();

  return loadPromise;
}

/**
 * 查询基因集合内的所有 STRING 边。
 *
 * @param {string[]} inputGenes 基因 symbol 列表
 * @param {number} [threshold=400] 最低 combined_score 阈值（在索引阈值基础上再过滤）
 * @returns {Promise<{
 *   edges: Array<[string, string, number]>,
 *   inputCount: number,
 *   resolvedCount: number,
 *   unresolved: string[]
 * }>}
 */
async function lookupEdges(inputGenes, threshold = DEFAULT_THRESHOLD) {
  const { adjacency } = await loadIndex();

  // 标准化：trim、大写、去重、去空
  const seen = new Set();
  const uniqueGenes = [];
  for (const g of inputGenes || []) {
    const s = String(g).trim().toUpperCase();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    uniqueGenes.push(s);
  }
  const geneSet = seen;

  const edges = [];
  const resolved = new Set();
  for (const gene of uniqueGenes) {
    const neighbors = adjacency.get(gene);
    if (!neighbors) continue;
    resolved.add(gene);
    for (const [other, score] of neighbors) {
      // adjacency 单向存储（gene < other），所以遍历每个 input gene 的邻居即可
      if (geneSet.has(other) && score >= threshold) {
        edges.push([gene, other, score]);
      }
    }
  }

  const unresolved = uniqueGenes.filter((g) => !adjacency.has(g));

  return {
    edges,
    inputCount: uniqueGenes.length,
    resolvedCount: resolved.size,
    unresolved,
  };
}

module.exports = { loadIndex, lookupEdges, DEFAULT_THRESHOLD };
