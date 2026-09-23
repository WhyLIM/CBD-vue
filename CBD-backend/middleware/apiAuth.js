const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { query, run } = require('../config/database');

// 公共 API 密钥认证：
// - 请求头 X-API-Key 携带 cbd_ 前缀密钥 → 校验、按密钥独立限流、跳过 IP 限流
// - 未携带密钥 → 匿名访问，按 server.js 的 IP 限流
// - 密钥无效或已吊销 → 401
// - 重型端点（下载/提交/PRS 计算/STRING 代理）不接受密钥提权，按匿名处理

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// 有效密钥内存缓存（5 分钟），避免每个请求都查库；负缓存同样生效
const keyCache = new Map();
const KEY_CACHE_TTL = 5 * 60 * 1000;

// last_used_at 每密钥至多每 60 秒回写一次，避免高频请求打写库
const lastTouch = new Map();

// 无效密钥尝试节流（按 IP）：格式正确但查无此钥的尝试会穿透缓存打一次 DB
// SELECT，攻击者可用随机密钥做负载放大。同一 IP 在 INVALID_WINDOW_MS 内
// 超过 INVALID_MAX 次无效尝试后直接 429，不再查库；密钥校验成功即清零。
const INVALID_WINDOW_MS = 5 * 60 * 1000;
const INVALID_MAX = 20;
const invalidByIp = new Map();

function sweepInvalid() {
    const now = Date.now();
    for (const [ip, rec] of invalidByIp) {
        if (now - rec.windowStart > INVALID_WINDOW_MS) invalidByIp.delete(ip);
    }
}

function recordInvalid(ip) {
    if (invalidByIp.size > 5000) sweepInvalid();
    const now = Date.now();
    const rec = invalidByIp.get(ip);
    if (!rec || now - rec.windowStart > INVALID_WINDOW_MS) {
        invalidByIp.set(ip, { count: 1, windowStart: now });
        return 1;
    }
    rec.count += 1;
    return rec.count;
}

function invalidExceeded(ip) {
    const rec = invalidByIp.get(ip);
    return !!rec && rec.count >= INVALID_MAX && Date.now() - rec.windowStart <= INVALID_WINDOW_MS;
}

// 不允许通过 API 密钥提权访问的端点前缀（重型计算 / 写入 / 大体积导出）
const RESTRICTED_PREFIXES = [
    '/api/download',
    '/api/submission',
    '/api/network',
    '/api/string',
    '/api/uploads'
];

// 按密钥独立限流：默认 6000 次 / 15 分钟（可在 api_keys.rate_limit 按密钥调整）
const perKeyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    keyGenerator: (req) => String(req.apiKeyId),
    limit: (req) => req.apiRateLimit || 6000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'API rate limit exceeded for this key (15-minute window). Slow down or contact us to raise the limit.'
    }
});

async function lookupKey(raw) {
    const hash = sha256(raw);
    const hit = keyCache.get(hash);
    if (hit && Date.now() - hit.at < KEY_CACHE_TTL) return hit.row;
    const rows = await query('SELECT id, name, rate_limit, active FROM api_keys WHERE key_hash = ?', [hash]);
    const row = (rows[0] && rows[0].active) ? { id: rows[0].id, name: rows[0].name, rate_limit: rows[0].rate_limit } : null;
    keyCache.set(hash, { at: Date.now(), row });
    return row;
}

function touchKey(id) {
    const now = Date.now();
    if (now - (lastTouch.get(id) || 0) < 60 * 1000) return;
    lastTouch.set(id, now);
    run('UPDATE api_keys SET last_used_at = NOW() WHERE id = ?', [id]).catch(() => {});
}

async function apiAuth(req, res, next) {
    const raw = req.get('X-API-Key');
    if (!raw) return next(); // 匿名访问，按 IP 限流

    // 无效密钥尝试超限的 IP 直接 429，不再消耗 DB 查询
    const ip = req.ip;
    if (invalidExceeded(ip)) {
        return res.status(429).json({
            success: false,
            error: 'Too many invalid API key attempts. Try again later.'
        });
    }

    if (!/^cbd_[0-9a-f]{32}$/.test(raw)) {
        recordInvalid(ip);
        return res.status(401).json({
            success: false,
            error: 'Invalid API key format. Expected header: X-API-Key: cbd_<32 hex chars>.'
        });
    }

    // 重型端点不接受密钥提权：按匿名处理（继续走 IP 限流）
    if (RESTRICTED_PREFIXES.some(p => req.originalUrl.startsWith(p))) return next();

    let row;
    try {
        row = await lookupKey(raw);
    } catch (e) {
        // 密钥校验的数据库故障不应阻塞站点，降级为匿名
        console.error('api key lookup failed:', e.message);
        return next();
    }

    if (!row) {
        recordInvalid(ip);
        return res.status(401).json({ success: false, error: 'Invalid or revoked API key.' });
    }

    invalidByIp.delete(ip); // 校验成功，清除该 IP 的失败计数
    req.apiKeyId = row.id;
    req.apiRateLimit = row.rate_limit;
    req.apiKeyBypass = true;
    touchKey(row.id);
    perKeyLimiter(req, res, next);
}

module.exports = { apiAuth };
