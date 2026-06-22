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

// DEGs - 火山图全量数据（不分页）
router.get('/degs/chart', async (req, res, next) => {
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const rows = await query(`SELECT gene, logFC, pval_adj, neg_log10_padj FROM analysis_degs ${whereSql}`, params)
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/degs/chart error:', e)
        res.json({ success: true, data: [] })
    }
})

// Gene Diff Celltype - 火山图全量数据
router.get('/gene-diff/celltype/chart', async (req, res, next) => {
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const rows = await query(`SELECT gene, avg_log2FC, p_val_adj FROM analysis_gene_diff_celltype ${whereSql}`, params)
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/gene-diff/celltype/chart error:', e)
        res.json({ success: true, data: [] })
    }
})

// Gene Diff TvsN - 火山图全量数据
router.get('/gene-diff/tvsn/chart', async (req, res, next) => {
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const rows = await query(`SELECT gene, avg_log2FC, p_val_adj FROM analysis_gene_diff_TvsN ${whereSql}`, params)
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/gene-diff/tvsn/chart error:', e)
        res.json({ success: true, data: [] })
    }
})

// DEGs - 基因搜索
router.get('/degs/gene-search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.length < 1) return res.json({ success: true, data: [] })
        const limit = Math.min(parseInt(req.query.limit) || 20, 50)
        const rows = await query(
            'SELECT DISTINCT gene FROM analysis_degs WHERE gene LIKE ? LIMIT ?',
            [q.toUpperCase() + '%', limit]
        )
        res.json({ success: true, data: rows.map(r => r.gene) })
    } catch (e) {
        console.error('analysis/degs/gene-search error:', e)
        res.json({ success: true, data: [] })
    }
})

// Gene Diff - 基因搜索（合并 celltype + TvsN 两张表）
router.get('/gene-diff/gene-search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.length < 1) return res.json({ success: true, data: [] })
        const limit = Math.min(parseInt(req.query.limit) || 20, 50)
        const like = q.toUpperCase() + '%'
        const [r1, r2] = await Promise.all([
            query('SELECT DISTINCT gene FROM analysis_gene_diff_celltype WHERE gene LIKE ? LIMIT ?', [like, limit]),
            query('SELECT DISTINCT gene FROM analysis_gene_diff_TvsN WHERE gene LIKE ? LIMIT ?', [like, limit])
        ])
        const genes = [...new Set([...r1.map(r => r.gene), ...r2.map(r => r.gene)])].slice(0, limit)
        res.json({ success: true, data: genes })
    } catch (e) {
        console.error('analysis/gene-diff/gene-search error:', e)
        res.json({ success: true, data: [] })
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

// CellChat 全量图表数据（不分页）
router.get('/cellchat/chart', async (req, res) => {
    try {
        const rows = await query('SELECT source, target, prob FROM analysis_cellchat')
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/cellchat/chart error:', e)
        res.json({ success: true, data: [] })
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

// ===== CBD3 新增路由 =====

// 基因差异表达 - 按细胞类型
router.get('/gene-diff/celltype', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.min_logfc) { where.push('ABS(avg_log2FC) >= ?'); params.push(parseFloat(req.query.min_logfc)) }
        if (req.query.max_padj) { where.push('p_val_adj <= ?'); params.push(parseFloat(req.query.max_padj)) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        let order = 'ORDER BY p_val_adj ASC'
        const sort = (req.query.sort || '').toLowerCase()
        if (sort === 'logfc_desc') order = 'ORDER BY ABS(avg_log2FC) DESC'
        if (sort === 'logfc_asc') order = 'ORDER BY avg_log2FC ASC'
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_gene_diff_celltype ${whereSql}`, params)
        const rows = await query(`SELECT p_val, avg_log2FC, pct_1, pct_2, p_val_adj, celltype, gene FROM analysis_gene_diff_celltype ${whereSql} ${order} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/gene-diff/celltype error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// 基因差异表达 - Tumor vs Normal
router.get('/gene-diff/tvsn', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.condition) { where.push('`condition` = ?'); params.push(req.query.condition) }
        if (req.query.min_logfc) { where.push('ABS(avg_log2FC) >= ?'); params.push(parseFloat(req.query.min_logfc)) }
        if (req.query.max_padj) { where.push('p_val_adj <= ?'); params.push(parseFloat(req.query.max_padj)) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        let order = 'ORDER BY p_val_adj ASC'
        const sort = (req.query.sort || '').toLowerCase()
        if (sort === 'logfc_desc') order = 'ORDER BY ABS(avg_log2FC) DESC'
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_gene_diff_TvsN ${whereSql}`, params)
        const rows = await query(`SELECT p_val, avg_log2FC, pct_1, pct_2, p_val_adj, gene, celltype, \`condition\` FROM analysis_gene_diff_TvsN ${whereSql} ${order} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/gene-diff/tvsn error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// ROC - T/N 预测能力
router.get('/roc/tn', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.min_auc) { where.push('auc >= ?'); params.push(parseFloat(req.query.min_auc)) }
        if (req.query.direction) { where.push('direction = ?'); params.push(req.query.direction) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        let order = 'ORDER BY auc DESC'
        const sort = (req.query.sort || '').toLowerCase()
        if (sort === 'pvalue_asc') order = 'ORDER BY p_value ASC'
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_roc_tn ${whereSql}`, params)
        const rows = await query(`SELECT celltype, gene, auc, p_value, direction, roc_label FROM analysis_roc_tn ${whereSql} ${order} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/roc/tn error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// ROC - 细胞类型预测能力
router.get('/roc/celltype', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.min_auc) { where.push('auc >= ?'); params.push(parseFloat(req.query.min_auc)) }
        if (req.query.direction) { where.push('direction = ?'); params.push(req.query.direction) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        let order = 'ORDER BY auc DESC'
        const sort = (req.query.sort || '').toLowerCase()
        if (sort === 'pvalue_asc') order = 'ORDER BY p_value ASC'
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_roc_celltype ${whereSql}`, params)
        const rows = await query(`SELECT celltype, gene, auc, p_value, direction, roc_label FROM analysis_roc_celltype ${whereSql} ${order} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/roc/celltype error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// ROC 图表全量数据（不分页）
router.get('/roc/chart', async (req, res) => {
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.min_auc) { where.push('auc >= ?'); params.push(parseFloat(req.query.min_auc)) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const table = req.query.tab === 'celltype' ? 'analysis_roc_celltype' : 'analysis_roc_tn'
        const rows = await query(`SELECT gene, auc, p_value, roc_label FROM ${table} ${whereSql} ORDER BY auc DESC LIMIT 5000`, params)
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/roc/chart error:', e)
        res.json({ success: true, data: [] })
    }
})

// PRS 网络敏感度 - 基因搜索
router.get('/prs/gene-search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.length < 1) return res.json({ success: true, data: [] })
        const limit = Math.min(parseInt(req.query.limit) || 20, 50)
        const rows = await query(
            'SELECT DISTINCT gene FROM analysis_network_prs WHERE gene LIKE ? LIMIT ?',
            [q.toUpperCase() + '%', limit]
        )
        res.json({ success: true, data: rows.map(r => r.gene) })
    } catch (e) {
        console.error('analysis/prs/gene-search error:', e)
        res.json({ success: true, data: [] })
    }
})

// ROC 预测能力 - 基因搜索（合并 tn + celltype 两张表）
router.get('/roc/gene-search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.length < 1) return res.json({ success: true, data: [] })
        const limit = Math.min(parseInt(req.query.limit) || 20, 50)
        const like = q.toUpperCase() + '%'
        const [r1, r2] = await Promise.all([
            query('SELECT DISTINCT gene FROM analysis_roc_tn WHERE gene LIKE ? LIMIT ?', [like, limit]),
            query('SELECT DISTINCT gene FROM analysis_roc_celltype WHERE gene LIKE ? LIMIT ?', [like, limit])
        ])
        const genes = [...new Set([...r1.map(r => r.gene), ...r2.map(r => r.gene)])].slice(0, limit)
        res.json({ success: true, data: genes })
    } catch (e) {
        console.error('analysis/roc/gene-search error:', e)
        res.json({ success: true, data: [] })
    }
})

// Biomarker CellChat - 基因搜索
router.get('/biomk-cellchat/gene-search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.length < 1) return res.json({ success: true, data: [] })
        const limit = Math.min(parseInt(req.query.limit) || 20, 50)
        const rows = await query(
            'SELECT DISTINCT gene FROM analysis_biomk_cellchat WHERE gene LIKE ? LIMIT ?',
            [q.toUpperCase() + '%', limit]
        )
        res.json({ success: true, data: rows.map(r => r.gene) })
    } catch (e) {
        console.error('analysis/biomk-cellchat/gene-search error:', e)
        res.json({ success: true, data: [] })
    }
})

// PRS 网络敏感度 - 散点图全量数据（不分页，仅绘图字段）
router.get('/prs/scatter', async (req, res, next) => {
    try {
        const celltype = req.query.celltype
        if (!celltype) {
            return res.json({ success: true, data: [] })
        }
        const rows = await query(
            'SELECT gene, deg, eff, sens, trans, eigenvec_centr, closeness_centr FROM analysis_network_prs WHERE celltype = ?',
            [celltype]
        )
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/prs/scatter error:', e)
        res.json({ success: true, data: [] })
    }
})

// PRS 网络敏感度
router.get('/prs', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_network_prs ${whereSql}`, params)
        const rows = await query(`SELECT gene, celltype, deg, eff, sens, trans, eigenvec_centr, closeness_centr FROM analysis_network_prs ${whereSql} ORDER BY sens DESC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/prs error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// Biomarker CellChat - 表格数据
router.get('/biomk-cellchat', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.biomark_as) { where.push('biomark_as = ?'); params.push(req.query.biomark_as) }
        if (req.query.source) { where.push('source = ?'); params.push(req.query.source) }
        if (req.query.target) { where.push('target = ?'); params.push(req.query.target) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_biomk_cellchat ${whereSql}`, params)
        const rows = await query(`SELECT gene, biomark_as, source, target, ligand, receptor, pathway_name, prob, pval, interaction_name FROM analysis_biomk_cellchat ${whereSql} ORDER BY prob DESC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/biomk-cellchat error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// Biomarker CellChat - 网络图
router.get('/biomk-cellchat/network', async (req, res, next) => {
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.biomark_as) { where.push('biomark_as = ?'); params.push(req.query.biomark_as) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const edges = await query(`SELECT source, target, prob, gene, biomark_as, pathway_name FROM analysis_biomk_cellchat ${whereSql}`, params)
        const nodeSet = new Set()
        edges.forEach(e => { nodeSet.add(e.source); nodeSet.add(e.target) })
        const nodes = Array.from(nodeSet).map(id => ({ id, type: 'cell' }))
        res.json({ success: true, data: { nodes, edges } })
    } catch (e) {
        console.error('analysis/biomk-cellchat/network error:', e)
        next(e)
    }
})

// Pseudotime - 轨迹数据
router.get('/pseudotime/trajectory', async (req, res, next) => {
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const rows = await query(`SELECT cell_id, pseudotime, state, cell_type FROM scrna_pseudotime ${whereSql} ORDER BY pseudotime ASC LIMIT 20000`, params)
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/pseudotime/trajectory error:', e)
        return res.json({ success: true, data: [] })
    }
})

// Pseudotime - 基因搜索（仅搜索 scrna_pseudotime_gene_expr 表中存在的基因）
router.get('/pseudotime/gene-search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.length < 1) return res.json({ success: true, data: [] })
        const limit = Math.min(parseInt(req.query.limit) || 20, 50)
        const rows = await query(
            'SELECT DISTINCT gene FROM scrna_pseudotime_gene_expr WHERE gene LIKE ? LIMIT ?',
            [q.toUpperCase() + '%', limit]
        )
        res.json({ success: true, data: rows.map(r => r.gene) })
    } catch (e) {
        console.error('analysis/pseudotime/gene-search error:', e)
        res.json({ success: true, data: [] })
    }
})

// Pseudotime - 基因表达
router.get('/pseudotime/gene-expr', async (req, res, next) => {
    try {
        const where = []
        const params = []
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const rows = await query(`SELECT cell_id, expr, gene, cell_type FROM scrna_pseudotime_gene_expr ${whereSql} LIMIT 20000`, params)
        res.json({ success: true, data: rows })
    } catch (e) {
        console.error('analysis/pseudotime/gene-expr error:', e)
        return res.json({ success: true, data: [] })
    }
})

// PPI 边数据
router.get('/ppi/edges', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('(node1 = ? OR node2 = ?)'); params.push(req.query.gene, req.query.gene) }
        if (req.query.min_score) { where.push('combined_score >= ?'); params.push(parseFloat(req.query.min_score)) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_ppi_edge ${whereSql}`, params)
        const rows = await query(`SELECT node1, node2, combined_score FROM analysis_ppi_edge ${whereSql} ORDER BY combined_score DESC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/ppi/edges error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// PPI 网络拓扑
router.get('/ppi/topology', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.celltype) { where.push('celltype = ?'); params.push(req.query.celltype) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM analysis_network_ppi ${whereSql}`, params)
        const rows = await query(`SELECT gene, celltype, degree, betweenness, closeness, avg_shortest_path FROM analysis_network_ppi ${whereSql} ORDER BY degree DESC LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/ppi/topology error:', e)
        return res.json(respond([], page, limit, 0))
    }
})

// 基因表达汇总 (Dotplot 数据)
router.get('/gene-expr-summary', async (req, res, next) => {
    const { page, limit, offset } = paginate(req)
    try {
        const where = []
        const params = []
        if (req.query.gene) { where.push('gene = ?'); params.push(req.query.gene) }
        if (req.query.cell_type) { where.push('cell_type = ?'); params.push(req.query.cell_type) }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
        const totalRows = await query(`SELECT COUNT(*) as c FROM scrna_gene_expr_summary ${whereSql}`, params)
        const rows = await query(`SELECT gene, cell_type, avg_exp, pct_exp FROM scrna_gene_expr_summary ${whereSql} LIMIT ${limit} OFFSET ${offset}`, params)
        res.json(respond(rows, page, limit, totalRows[0]?.c || 0))
    } catch (e) {
        console.error('analysis/gene-expr-summary error:', e)
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
        // CBD3 新增筛选器
        const gdCelltypeRows = await query(`SELECT DISTINCT celltype FROM analysis_gene_diff_celltype`)
        const gdTvsNCelltypeRows = await query(`SELECT DISTINCT celltype FROM analysis_gene_diff_TvsN`)
        const gdTvsNCondRows = await query(`SELECT DISTINCT \`condition\` FROM analysis_gene_diff_TvsN`)
        const rocTnCelltypeRows = await query(`SELECT DISTINCT celltype FROM analysis_roc_tn`)
        const rocCelltypeRows = await query(`SELECT DISTINCT celltype FROM analysis_roc_celltype`)
        const prsCelltypeRows = await query(`SELECT DISTINCT celltype FROM analysis_network_prs`)
        const biomkGeneRows = await query(`SELECT DISTINCT gene FROM analysis_biomk_cellchat`)
        const biomkAsRows = await query(`SELECT DISTINCT biomark_as FROM analysis_biomk_cellchat`)
        const pseudoCtRows = await query(`SELECT DISTINCT cell_type FROM scrna_pseudotime`)
        const ppiCelltypeRows = await query(`SELECT DISTINCT celltype FROM analysis_network_ppi`)
        const data = {
            degsCellTypes: (degsRows || []).map(r => r.cell_type).filter(Boolean),
            keggCellTypes: (keggRows || []).map(r => r.cell_type).filter(Boolean),
            ridgeCellTypes: (ridgeRows || []).map(r => r.cell_type).filter(Boolean),
            trajectoryCellTypes: (trajRows || []).map(r => r.cell_type).filter(Boolean),
            plotTypes: (plotTypesRows || []).map(r => r.plot_type).filter(Boolean),
            sourceTypes: (sourceTypesRows || []).map(r => r.source_type).filter(Boolean),
            // CBD3 新增
            gdCelltypes: (gdCelltypeRows || []).map(r => r.celltype).filter(Boolean),
            gdTvsNCelltypes: (gdTvsNCelltypeRows || []).map(r => r.celltype).filter(Boolean),
            gdTvsNConditions: (gdTvsNCondRows || []).map(r => r.condition).filter(Boolean),
            rocTnCelltypes: (rocTnCelltypeRows || []).map(r => r.celltype).filter(Boolean),
            rocCelltypes: (rocCelltypeRows || []).map(r => r.celltype).filter(Boolean),
            prsCelltypes: (prsCelltypeRows || []).map(r => r.celltype).filter(Boolean),
            biomkGenes: (biomkGeneRows || []).map(r => r.gene).filter(Boolean),
            biomkAs: (biomkAsRows || []).map(r => r.biomark_as).filter(Boolean),
            pseudotimeCellTypes: (pseudoCtRows || []).map(r => r.cell_type).filter(Boolean),
            ppiCelltypes: (ppiCelltypeRows || []).map(r => r.celltype).filter(Boolean),
        }
        res.json({ success: true, data })
    } catch (e) {
        console.error('analysis/metadata/filters error:', e)
        res.json({ success: true, data: { degsCellTypes: [], keggCellTypes: [], ridgeCellTypes: [], trajectoryCellTypes: [], plotTypes: [], sourceTypes: [], gdCelltypes: [], gdTvsNCelltypes: [], gdTvsNConditions: [], rocTnCelltypes: [], rocCelltypes: [], prsCelltypes: [], biomkGenes: [], biomkAs: [], pseudotimeCellTypes: [], ppiCelltypes: [] } })
    }
})

module.exports = router
