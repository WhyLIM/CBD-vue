/**
 * 公共 API 密钥管理脚本（在能连数据库的机器上运行）：
 *
 *   签发：  node scripts/create_api_key.js --name "Zhang Lab" --contact lab@example.edu [--limit 6000]
 *   列表：  node scripts/create_api_key.js --list
 *   吊销：  node scripts/create_api_key.js --revoke cbd_ab12cd34...   （也可用 id 或 12 位前缀）
 *   恢复：  node scripts/create_api_key.js --enable <id或前缀>
 *
 * 明文密钥只在签发时展示一次，数据库仅保存 SHA-256 哈希；遗失只能吊销重发。
 */

const crypto = require('crypto');
const { query, run, closePool } = require('../config/database');

const PREFIX = 'cbd_';

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--list') args.action = 'list';
        else if (a === '--revoke') { args.action = 'revoke'; args.target = argv[++i]; }
        else if (a === '--enable') { args.action = 'enable'; args.target = argv[++i]; }
        else if (a.startsWith('--name=')) args.name = a.slice(7);
        else if (a === '--name') args.name = argv[++i];
        else if (a.startsWith('--contact=')) args.contact = a.slice(10);
        else if (a === '--contact') args.contact = argv[++i];
        else if (a.startsWith('--limit=')) args.limit = parseInt(a.slice(8), 10);
        else if (a === '--limit') args.limit = parseInt(argv[++i], 10);
    }
    if (!args.action) args.action = args.name ? 'create' : 'list';
    return args;
}

async function create(args) {
    if (!args.name) throw new Error('签发必须提供 --name "使用者名称"');
    const key = PREFIX + crypto.randomBytes(16).toString('hex'); // cbd_ + 32 位十六进制
    const result = await run(
        'INSERT INTO api_keys (name, contact, key_hash, key_prefix, rate_limit) VALUES (?, ?, ?, ?, ?)',
        [args.name, args.contact || null, sha256(key), key.slice(0, PREFIX.length + 8), args.limit || 6000]
    );
    console.log('✅ 密钥签发成功（明文仅此一次展示，请立即妥善保存）\n');
    console.log(`  密钥:   ${key}`);
    console.log(`  名称:   ${args.name}`);
    console.log(`  联系:   ${args.contact || '-'}`);
    console.log(`  限流:   ${args.limit || 6000} 次 / 15 分钟`);
    console.log(`  id:     ${result.insertId}\n`);
    console.log('  使用方式（请求头携带）:  X-API-Key: ' + key);
}

async function list() {
    const rows = await query('SELECT id, name, contact, key_prefix, rate_limit, active, created_at, last_used_at FROM api_keys ORDER BY id');
    if (!rows.length) { console.log('（暂无密钥）'); return; }
    console.log('id\t名称\t前缀\t限流/15min\t状态\t最近使用\t创建时间\t联系');
    for (const r of rows) {
        console.log([
            r.id, r.name, r.key_prefix + '…', r.rate_limit,
            r.active ? '启用' : '已吊销',
            r.last_used_at ? String(r.last_used_at).slice(0, 19) : '-',
            String(r.created_at).slice(0, 19),
            r.contact || '-'
        ].join('\t'));
    }
}

async function toggle(target, active) {
    const isId = /^\d+$/.test(target);
    const column = isId ? 'id' : 'key_prefix';
    const value = isId ? parseInt(target, 10) : target.slice(0, 12);
    const result = await run(`UPDATE api_keys SET active = ? WHERE ${column} = ?`, [active ? 1 : 0, value]);
    if (result.affectedRows) {
        console.log(`✅ 已${active ? '恢复启用' : '吊销'}密钥（${column} = ${value}）`);
    } else {
        console.log('未找到匹配的密钥');
    }
}

(async () => {
    try {
        const args = parseArgs(process.argv);
        if (args.action === 'create') await create(args);
        else if (args.action === 'list') await list();
        else if (args.action === 'revoke') await toggle(args.target, false);
        else if (args.action === 'enable') await toggle(args.target, true);
        else console.log('用法见文件头部注释');
    } catch (e) {
        console.error('❌', e.message);
        process.exitCode = 1;
    } finally {
        await closePool();
    }
})();
