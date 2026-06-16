const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();

// Python 解释器（可通过环境变量覆盖，否则用系统默认 python）
const PYTHON_BIN = process.env.PYTHON_BIN || 'python';
// 包装脚本路径
const PRS_SCRIPT = path.join(__dirname, '..', 'scripts', 'prs_compute.py');
// 子进程超时（毫秒）
const TIMEOUT_MS = 30000;
// 请求体大小上限（字节）
const MAX_PAYLOAD = 2 * 1024 * 1024; // 2MB

// 简易 LRU 缓存：相同 edges 指纹的请求直接返回结果
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 小时
const CACHE_MAX = 50;
const cache = new Map(); // key -> { value, ts }

function fingerprint(edges, cluster) {
    const h = crypto.createHash('sha1');
    h.update(JSON.stringify({ edges, cluster }));
    return h.digest('hex');
}

function cacheGet(key) {
    const e = cache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    // LRU：重新插入到末尾
    cache.delete(key);
    cache.set(key, e);
    return e.value;
}

function cacheSet(key, value) {
    if (cache.size >= CACHE_MAX) {
        // 删除最早的一项
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

        // 写入 stdin 并关闭
        proc.stdin.write(body);
        proc.stdin.end();
    });
}

// POST /api/network/prs
// body: { edges: [[g1,g2], ...], cluster?: boolean }
router.post('/prs', async (req, res) => {
    try {
        const { edges, cluster = false } = req.body || {};

        // 基本校验
        if (!Array.isArray(edges) || edges.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'edges 必须是非空数组'
            });
        }
        // 大致估算 payload 大小
        const approxSize = JSON.stringify(req.body).length;
        if (approxSize > MAX_PAYLOAD) {
            return res.status(413).json({
                success: false,
                error: `请求体过大（${(approxSize / 1024).toFixed(0)} KB > ${(MAX_PAYLOAD / 1024).toFixed(0)} KB）`
            });
        }
        // 节点数上限预检（与 Python 端一致，提前拒绝）
        const nodeSet = new Set();
        for (const e of edges) {
            if (Array.isArray(e) && e.length === 2) {
                nodeSet.add(String(e[0])); nodeSet.add(String(e[1]));
            }
        }
        if (nodeSet.size > 500) {
            return res.status(400).json({
                success: false,
                error: `节点数 ${nodeSet.size} 超过上限 500`
            });
        }

        const key = fingerprint(edges, cluster);
        const cached = cacheGet(key);
        if (cached) {
            return res.json({ success: true, data: cached, cached: true });
        }

        const data = await runPrsScript({ edges, cluster });
        cacheSet(key, data);
        res.json({ success: true, data, cached: false });
    } catch (e) {
        console.error('network/prs error:', e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
