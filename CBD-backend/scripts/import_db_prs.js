/**
 * 把 data/db_prs_rebuild.csv 覆盖写入 analysis_network_prs 表。
 *
 * - 先 TRUNCATE 现有表（清空旧 numpy 计算/手工导入的数据）
 * - 流式读取 csv，分批 INSERT
 * - 失败自动 ROLLBACK
 *
 * 运行：在 CBD-backend 目录执行
 *   node scripts/import_db_prs.js
 *
 * 环境变量：
 *   BATCH_SIZE  每批插入行数（默认 200）
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { pool } = require('../config/database');

const CSV_FILE = path.join(__dirname, '..', 'data', 'db_prs_rebuild.csv');
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '200', 10);

async function main() {
  if (!fs.existsSync(CSV_FILE)) {
    throw new Error(`csv 不存在: ${CSV_FILE}，请先运行 node scripts/rebuild_db_prs.js`);
  }

  const conn = await pool.getConnection();
  try {
    console.log('[import_db_prs] 开始事务，TRUNCATE analysis_network_prs...');
    await conn.beginTransaction();
    await conn.query('TRUNCATE TABLE analysis_network_prs');

    // 流式读取（避免大文件内存爆炸）
    const txt = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = txt.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('celltype,'));
    console.log(`    待插入行: ${lines.length}`);

    const sql = 'INSERT INTO analysis_network_prs (celltype, gene, deg, eff, sens, trans, eigenvec_centr, closeness_centr) VALUES ?';
    const batch = [];
    let inserted = 0;
    for (const line of lines) {
      const cells = line.split(',');
      if (cells.length < 8) continue;
      batch.push([
        cells[0],                          // celltype
        cells[1],                          // gene
        Number(cells[2]) || null,          // deg
        Number(cells[3]) || null,          // eff
        Number(cells[4]) || null,          // sens
        Number(cells[5]) || null,          // trans
        Number(cells[6]) || null,          // eigenvec_centr
        Number(cells[7]) || null,          // closeness_centr
      ]);
      if (batch.length >= BATCH_SIZE) {
        await conn.query(sql, [batch]);
        inserted += batch.length;
        batch.length = 0;
        process.stdout.write(`\r    已插入 ${inserted} / ${lines.length}`);
      }
    }
    if (batch.length) {
      await conn.query(sql, [batch]);
      inserted += batch.length;
    }
    console.log(`\n    插入完成: ${inserted} 行`);

    await conn.commit();
    console.log('[import_db_prs] 提交成功。');

    // 校验
    const cnt = await conn.query('SELECT COUNT(*) AS c FROM analysis_network_prs');
    console.log(`    表内总行: ${cnt[0][0]?.c}`);
    const celltypes = await conn.query('SELECT DISTINCT celltype FROM analysis_network_prs');
    console.log(`    celltype 列表: ${celltypes[0].map(r => r.celltype).join(', ')}`);
  } catch (e) {
    await conn.rollback();
    console.error('[import_db_prs] 失败，已回滚:', e.message);
    throw e;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
