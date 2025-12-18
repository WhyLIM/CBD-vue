const express = require('express')
const { query } = require('../config/database')
const router = express.Router()

const paginate = (req) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.max(Math.min(parseInt(req.query.limit) || 20, 100), 1)
    const offset = (page - 1) * limit
    return { page, limit, offset }
}

const respond = (rows, page, limit, total) => ({
    success: true,
    data: rows,
    pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
    }
})

router.get('/diagnosis', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.label) { where.push('label = ?'); params.push(req.query.label) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM clinical_diagnosis ${whereSql}`, params)
        const rows = await query(`SELECT gene, auc, label, application, p_value FROM clinical_diagnosis ${whereSql} ORDER BY auc DESC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('clinical/diagnosis error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/survival', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.surv_type) { where.push('surv_type = ?'); params.push(req.query.surv_type) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM clinical_survival ${whereSql}`, params)
        const rows = await query(`SELECT gene, surv_type, surv_pvalue, specific_time, surv_prob_high, surv_prob_low, surv_label FROM clinical_survival ${whereSql} ORDER BY surv_pvalue ASC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('clinical/survival error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/immune', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.immune_cell) { where.push('immune_cell = ?'); params.push(req.query.immune_cell) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM clinical_immune ${whereSql}`, params)
        const rows = await query(`SELECT gene, immune_cell, r2, p_value FROM clinical_immune ${whereSql} ORDER BY r2 DESC, p_value ASC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('clinical/immune error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

module.exports = router
