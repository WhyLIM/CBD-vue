/**
 * Database 模式数据重建脚本。
 *
 * 流程（完全按 network_PRS.R 的逻辑）：
 *   1. 读取 dual_specific_genes.csv（8 个 celltype 的目标基因列表）
 *   2. 对每个 celltype：
 *      - 调用 src/stringIndex.js 查 STRING 边
 *      - 调 scripts/prs_compute.py 算 PRS（enm_package 算法）
 *      - 收集 (celltype, gene, deg, eff, sens, trans, eigenvec_centr, closeness_centr)
 *   3. 输出 data/db_prs_rebuild.csv（供 import_db_prs.js 入库）
 *
 * 运行：在 CBD-backend 目录执行
 *   node scripts/rebuild_db_prs.js
 *
 * 可选环境变量：
 *   DUAL_GENES_CSV  dual_specific_genes.csv 路径
 *                   （默认 数据/extracted/dual_specific_genes.csv）
 *   SCORE_THRESHOLD STRING 最低分数（默认 400）
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { lookupEdges } = require('../src/stringIndex');

const DUAL_GENES_CSV = process.env.DUAL_GENES_CSV
  || path.resolve(__dirname, '../../../数据/extracted/dual_specific_genes.csv');
const THRESHOLD = parseInt(process.env.SCORE_THRESHOLD || '400', 10);
const PYTHON_BIN = process.env.PYTHON_BIN || 'python';
const PRS_SCRIPT = path.join(__dirname, 'prs_compute.py');
const OUT_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(OUT_DIR, 'db_prs_rebuild.csv');

function readDualGenes() {
  const txt = fs.readFileSync(DUAL_GENES_CSV, 'utf8');
  const lines = txt.split(/\r?\n/).filter((l) => l.trim());
  // 跳过表头
  const byCelltype = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map((s) => s.trim());
    if (cells.length < 2) continue;
    const ct = cells[0];
    const gene = cells[1];
    if (!ct || !gene) continue;
    if (!byCelltype.has(ct)) byCelltype.set(ct, []);
    byCelltype.get(ct).push(gene.toUpperCase());
  }
  return byCelltype;
}

function runPrsScript(edges) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ edges, cluster: false }));
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
        reject(new Error('PRS 子进程超时（60s）'));
      }
    }, 60000);

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`无法启动 Python: ${err.message}`));
      }
    });
    proc.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0) {
        return reject(new Error(`Python 退出码 ${code}: ${stderr.slice(0, 300)}`));
      }
      try {
        const out = JSON.parse(stdout);
        if (!out.success) return reject(new Error(out.error || 'PRS 计算失败'));
        resolve(out.data);
      } catch (e) {
        reject(new Error(`解析 Python 输出失败: ${e.message}`));
      }
    });
    proc.stdin.write(body);
    proc.stdin.end();
  });
}

async function main() {
  if (!fs.existsSync(DUAL_GENES_CSV)) {
    throw new Error(`dual_specific_genes.csv 不存在: ${DUAL_GENES_CSV}`);
  }

  console.log(`[rebuild_db_prs] 读取 ${DUAL_GENES_CSV}`);
  const byCelltype = readDualGenes();
  console.log(`    共 ${byCelltype.size} 个 celltype`);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const outLines = ['celltype,gene,deg,eff,sens,trans,eigenvec_centr,closeness_centr'];

  let totalGenes = 0;
  let totalRows = 0;
  let skippedNoEdge = 0;

  for (const [ct, genes] of byCelltype) {
    const uniqGenes = [...new Set(genes)];
    totalGenes += uniqGenes.length;
    process.stdout.write(`[${ct}] ${uniqGenes.length} 基因 ... `);

    const lookup = await lookupEdges(uniqGenes, THRESHOLD);
    if (lookup.edges.length === 0) {
      console.log(`跳过：STRING 在 score≥${THRESHOLD} 下未找到边（未解析 ${lookup.unresolved.length}）`);
      skippedNoEdge++;
      continue;
    }

    const edges = lookup.edges.map(([a, b]) => [a, b]);

    // 预估最大连通分量节点数；prody GNM 在 n<3 时会崩溃，需跳过。
    const adj = new Map();
    for (const [a, b] of edges) {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a).add(b); adj.get(b).add(a);
    }
    // 找最大连通分量大小
    const visited = new Set();
    let maxComp = 0;
    for (const node of adj.keys()) {
      if (visited.has(node)) continue;
      let size = 0;
      const stack = [node];
      while (stack.length) {
        const cur = stack.pop();
        if (visited.has(cur)) continue;
        visited.add(cur);
        size++;
        for (const nb of adj.get(cur)) if (!visited.has(nb)) stack.push(nb);
      }
      if (size > maxComp) maxComp = size;
    }
    if (maxComp < 3) {
      console.log(`跳过：最大连通分量仅 ${maxComp} 节点（< 3，prody 无法求解）`);
      skippedNoEdge++;
      continue;
    }

    const data = await runPrsScript(edges);

    // 为该 celltype 写入所有节点指标
    for (const m of data.metrics) {
      outLines.push([
        ct,
        m.gene,
        m.deg,
        m.eff,
        m.sens,
        m.trans,
        m.eigenvec_centr,
        m.closeness_centr,
      ].join(','));
      totalRows++;
    }
    console.log(`${lookup.edges.length} 边 → ${data.metrics.length} 节点 · unresolved=${lookup.unresolved.length} · ${data.elapsed_ms.gnm}ms`);
  }

  fs.writeFileSync(OUT_FILE, outLines.join('\n') + '\n', 'utf8');
  console.log(`\n[rebuild_db_prs] 完成。`);
  console.log(`    celltype 数: ${byCelltype.size}`);
  console.log(`    跳过(无边): ${skippedNoEdge}`);
  console.log(`    总基因数: ${totalGenes}`);
  console.log(`    总结果行: ${totalRows}`);
  console.log(`    输出: ${OUT_FILE}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
