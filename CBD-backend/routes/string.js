const express = require('express');
const axios = require('axios');
const router = express.Router();

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
