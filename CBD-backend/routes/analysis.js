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

router.get('/degs', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        let order = 'ORDER BY neg_log10_padj DESC'
        const sort = (req.query.sort || '').toLowerCase()
        if (sort === 'logfc_desc') order = 'ORDER BY logFC DESC'
        if (sort === 'pval_adj_asc') order = 'ORDER BY pval_adj ASC'
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_degs ${whereSql}`, params)
        const rows = await query(`SELECT cell_type, gene, logFC, pval_adj, neg_log10_padj FROM analysis_degs ${whereSql} ${order} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/degs error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/kegg', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        if (req.query.source_type) { where.push('source_type = ?'); params.push(req.query.source_type) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        let order = 'ORDER BY p_adjust ASC'
        const sort = (req.query.sort || '').toLowerCase()
        if (sort === 'fold_enrichment_desc') order = 'ORDER BY fold_enrichment DESC'
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_kegg ${whereSql}`, params)
        const rows = await query(`SELECT cell_type, source_type, description, p_adjust, fold_enrichment, gene_ids FROM analysis_kegg ${whereSql} ${order} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/kegg error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/ridge', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        let order = 'ORDER BY auc DESC'
        const sort = (req.query.sort || '').toLowerCase()
        if (sort === 'p_value_asc') order = 'ORDER BY p_value ASC'
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_ridge ${whereSql}`, params)
        const rows = await query(`SELECT cell_type, gene, auc, p_value FROM analysis_ridge ${whereSql} ${order} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/ridge error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/trajectory/files', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.plot_type) { where.push('plot_type = ?'); params.push(req.query.plot_type) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_trajectory_files ${whereSql}`, params)
        const rows = await query(`SELECT cell_type, gene, file_path, plot_type FROM analysis_trajectory_files ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/trajectory/files error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/cellchat', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.source) { where.push('source = ?'); params.push(req.query.source) }
        if (req.query.target) { where.push('target = ?'); params.push(req.query.target) }
        if (req.query.pathway_name) { where.push('pathway_name = ?'); params.push(req.query.pathway_name) }
        if (req.query.ligand) { where.push('ligand = ?'); params.push(req.query.ligand) }
        if (req.query.receptor) { where.push('receptor = ?'); params.push(req.query.receptor) }
        if (req.query.min_prob) { where.push('prob >= ?'); params.push(parseFloat(req.query.min_prob)) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_cellchat ${whereSql}`, params)
        const rows = await query(`SELECT source, target, ligand, receptor, prob, pval, pathway_name FROM analysis_cellchat ${whereSql} ORDER BY prob DESC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/cellchat error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/cellchat/network', async (req, res, next) => {
    try {
        const where = []
        const params = []
        if (req.query.pathway_name) { where.push('pathway_name = ?'); params.push(req.query.pathway_name) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const edges = await query(`SELECT source, target, prob FROM analysis_cellchat ${whereSql}`, params)
        const nodeSet = new Set()
        edges.forEach(e => { nodeSet.add(e.source); nodeSet.add(e.target) })
        const nodes = Array.from(nodeSet).map(id => ({ id, type: 'cell' }))
        res.json({ success: true, data: { nodes, edges } })
    } catch (e) { next(e) }
})

router.get('/ppi', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_ppi ${whereSql}`, params)
        const rows = await query(`SELECT cell_type, node1, node2 FROM analysis_ppi ${whereSql} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/ppi error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

router.get('/metadata/filters', async (req, res, next) => {
    try {
        const degsRows = await query(`SELECT DISTINCT cell_type FROM analysis_degs`)
        const keggRows = await query(`SELECT DISTINCT cell_type FROM analysis_kegg`)
        const ridgeRows = await query(`SELECT DISTINCT cell_type FROM analysis_ridge`)
        const trajRows = await query(`SELECT DISTINCT cell_type FROM analysis_trajectory_files`)
        const plotTypesRows = await query(`SELECT DISTINCT plot_type FROM analysis_trajectory_files`)
        const sourceTypesRows = await query(`SELECT DISTINCT source_type FROM analysis_kegg`)
        const data = {
            degsCellTypes: (degsRows || []).map(r => r.cell_type).filter(Boolean),
            keggCellTypes: (keggRows || []).map(r => r.cell_type).filter(Boolean),
            ridgeCellTypes: (ridgeRows || []).map(r => r.cell_type).filter(Boolean),
            trajectoryCellTypes: (trajRows || []).map(r => r.cell_type).filter(Boolean),
            plotTypes: (plotTypesRows || []).map(r => r.plot_type).filter(Boolean),
            sourceTypes: (sourceTypesRows || []).map(r => r.source_type).filter(Boolean)
        }
        res.json({ success: true, data })
    } catch (e) {
        console.error('analysis/metadata/filters error:', e)
        res.json({ success: true, data: { degsCellTypes: [], keggCellTypes: [], ridgeCellTypes: [], trajectoryCellTypes: [], plotTypes: [], sourceTypes: [] } })
    }
})

module.exports = router
