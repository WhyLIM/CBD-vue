/**
 * STRING 数据预处理：把 STRING info + links 文件预处理为进程内可快速查询的邻接表 JSON。
 *
 * 数据源（默认）：
 *   数据/upload_website/4.gene_sensitivity/9606.protein.info.v12.0.txt.gz
 *   数据/upload_website/4.gene_sensitivity/9606.protein.links.v12.0.onlyAB.txt.gz
 *
 * 可通过环境变量覆盖：
 *   STRING_DATA_DIR  数据目录
 *   SCORE_THRESHOLD  最低 combined_score（默认 400，STRING high-confidence 推荐）
 *
 * 输出：CBD-backend/data/string_index.json
 *   格式：{ "GENE_A": [["GENE_B", 950], ...], ... }
 *   单向存储（geneA < geneB），缩小体积
 *
 * 运行：node scripts/build_string_index.js
 */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const readline = require('readline');

const STRING_DIR = process.env.STRING_DATA_DIR
  || path.resolve(__dirname, '../../../数据/upload_website/4.gene_sensitivity');
const INFO_FILE = '9606.protein.info.v12.0.txt.gz';
const LINKS_FILE = '9606.protein.links.v12.0.onlyAB.txt.gz';
const SCORE_THRESHOLD = parseInt(process.env.SCORE_THRESHOLD || '400', 10);
const OUT_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(OUT_DIR, 'string_index.json');

function readGzipLines(filePath) {
  const stream = fs.createReadStream(filePath).pipe(zlib.createGunzip());
  return readline.createInterface({ input: stream, crlfDelay: Infinity });
}

async function main() {
  const infoPath = path.join(STRING_DIR, INFO_FILE);
  const linksPath = path.join(STRING_DIR, LINKS_FILE);
  if (!fs.existsSync(infoPath)) throw new Error(`未找到 STRING info 文件: ${infoPath}`);
  if (!fs.existsSync(linksPath)) throw new Error(`未找到 STRING links 文件: ${linksPath}`);

  console.log(`[1/3] 读取 ${INFO_FILE} 构建 id→gene 映射...`);
  const idToGene = new Map();
  let headerSkipped = false;
  const infoRl = readGzipLines(infoPath);
  for await (const line of infoRl) {
    if (!headerSkipped) { headerSkipped = true; continue; }
    const parts = line.split('\t');
    if (parts.length < 2) continue;
    const id = parts[0];
    const gene = parts[1];
    if (id && gene) idToGene.set(id, gene);
  }
  console.log(`    id→gene 条目: ${idToGene.size}`);

  console.log(`[2/3] 流式扫描 ${LINKS_FILE}，过滤 score ≥ ${SCORE_THRESHOLD}...`);
  const adjacency = new Map(); // 单向：geneA < geneB
  let totalEdges = 0;
  let keptEdges = 0;
  let droppedByScore = 0;
  let droppedByUnknownId = 0;
  headerSkipped = false;

  const linksRl = readGzipLines(linksPath);
  for await (const line of linksRl) {
    if (!headerSkipped) { headerSkipped = true; continue; }
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(' ');
    if (parts.length < 3) continue;
    totalEdges++;
    const score = parseInt(parts[2], 10);
    if (Number.isNaN(score) || score < SCORE_THRESHOLD) { droppedByScore++; continue; }
    const g1 = idToGene.get(parts[0]);
    const g2 = idToGene.get(parts[1]);
    if (!g1 || !g2) { droppedByUnknownId++; continue; }
    keptEdges++;
    const [a, b] = g1 < g2 ? [g1, g2] : [g2, g1];
    let bucket = adjacency.get(a);
    if (!bucket) { bucket = []; adjacency.set(a, bucket); }
    bucket.push([b, score]);
  }
  console.log(`    总边数: ${totalEdges}`);
  console.log(`    保留: ${keptEdges}`);
  console.log(`    score 不达标丢弃: ${droppedByScore}`);
  console.log(`    未知 protein id 丢弃: ${droppedByUnknownId}`);

  console.log(`[3/3] 写入 ${OUT_FILE}...`);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const obj = Object.create(null);
  for (const [k, v] of adjacency) obj[k] = v;
  fs.writeFileSync(OUT_FILE, JSON.stringify(obj));
  const sizeMB = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`    完成。基因数: ${adjacency.size}, 文件大小: ${sizeMB} MB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
