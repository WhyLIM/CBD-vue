const express = require('express')
const router = express.Router()
const db = require('../config/database')

const getArrayParam = (req, key) => {
    // Accept: key, key[], comma-separated string
    const val = req.query[key] ?? req.query[`${key}[]`]
    if (!val) return []
    if (Array.isArray(val)) return val.filter(v => v !== undefined && v !== null && String(v).trim() !== '')
    const s = String(val)
    if (s.includes(',')) return s.split(',').map(x => x.trim()).filter(Boolean)
    return [s]
}

router.get('/umap', async (req, res) => {
    try {
        const { page = 1, limit = 50000, bbox, colorBy = 'SubCluster', sample, patient, subcluster } = req.query
        const pageNum = Math.max(1, parseInt(page))
        const limitNum = Math.min(200000, Math.max(1, parseInt(limit)))
        const offset = (pageNum - 1) * limitNum

        let where = []
        let params = []

        if (Array.isArray(bbox) && bbox.length === 4) {
            where.push('c.UMAP_1 BETWEEN ? AND ?')
            where.push('c.UMAP_2 BETWEEN ? AND ?')
            params.push(parseFloat(bbox[0]), parseFloat(bbox[2]), parseFloat(bbox[1]), parseFloat(bbox[3]))
        }
        const subArr = getArrayParam(req, 'subcluster')
        if (subArr.length) {
            where.push(`m.SubCluster IN (${subArr.map(() => '?').join(',')})`)
            params.push(...subArr)
        }
        const sampArr = getArrayParam(req, 'sample')
        if (sampArr.length) {
            where.push(`m.Sample IN (${sampArr.map(() => '?').join(',')})`)
            params.push(...sampArr)
        }
        const patArr = getArrayParam(req, 'patient')
        if (patArr.length) {
            where.push(`m.Patient IN (${patArr.map(() => '?').join(',')})`)
            params.push(...patArr)
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

        const q = `
      SELECT c.Cell as cell, c.UMAP_1 as x, c.UMAP_2 as y,
             m.Color as color,
             m.Sample, m.Dataset, m.Patient, m.Class, m.SubCluster, m.MMRstatus,
             m.Position, m.Site, m.Grade, m.GrandparentalCluster, m.ParentalCluster,
             m.nCount_RNA, m.nFeature_RNA
      FROM scrna_umap_coordinates c
      JOIN scrna_metadata m ON m.Cell = c.Cell
      ${whereClause}
      LIMIT ${limitNum} OFFSET ${offset}
    `
        const rows = await db.query(q, params)
        res.json({ success: true, data: rows, pagination: { page: pageNum, limit: limitNum, count: rows.length } })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to load UMAP', error: e.message })
    }
})

router.get('/metadata/filters', async (req, res) => {
    try {
        const fields = ['Sample', 'Dataset', 'Patient', 'Class', 'SubCluster', 'MMRstatus', 'Position', 'Site', 'Grade', 'GrandparentalCluster', 'ParentalCluster']
        const result = {}
        for (const f of fields) {
            const rows = await db.query(`SELECT DISTINCT ${f} as value FROM scrna_metadata WHERE ${f} IS NOT NULL AND ${f}!='' ORDER BY ${f}`)
            result[f] = rows.map(r => r.value)
        }
        res.json({ success: true, data: result })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to load filters', error: e.message })
    }
})

router.get('/cell/:id', async (req, res) => {
    try {
        const id = req.params.id
        const q = `
      SELECT c.Cell as cell, c.UMAP_1 as x, c.UMAP_2 as y,
             m.*
      FROM scrna_umap_coordinates c
      JOIN scrna_metadata m ON m.Cell = c.Cell
      WHERE c.Cell = ?
      LIMIT 1
    `
        const rows = await db.query(q, [id])
        if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Cell not found' })
        res.json({ success: true, data: rows[0] })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get cell', error: e.message })
    }
})

router.get('/export', async (req, res) => {
    try {
        const { format = 'csv', subcluster, sample, patient, fields } = req.query
        let where = []
        let params = []
        const subArr = getArrayParam(req, 'subcluster')
        if (subArr.length) {
            where.push(`m.SubCluster IN (${subArr.map(() => '?').join(',')})`)
            params.push(...subArr)
        }
        const sampArr = getArrayParam(req, 'sample')
        if (sampArr.length) {
            where.push(`m.Sample IN (${sampArr.map(() => '?').join(',')})`)
            params.push(...sampArr)
        }
        const patArr = getArrayParam(req, 'patient')
        if (patArr.length) {
            where.push(`m.Patient IN (${patArr.map(() => '?').join(',')})`)
            params.push(...patArr)
        }
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

        const baseFields = ['c.Cell as cell', 'c.UMAP_1 as x', 'c.UMAP_2 as y', 'm.SubCluster', 'm.Sample', 'm.Patient', 'm.Color']
        const extra = (fields ? String(fields).split(',').map(s => s.trim()).filter(Boolean) : [])
            .map(f => `m.${f}`)
        const select = [...baseFields, ...extra].join(', ')
        const q = `SELECT ${select} FROM scrna_umap_coordinates c JOIN scrna_metadata m ON m.Cell=c.Cell ${whereClause} LIMIT 200000`
        const rows = await db.query(q, params)

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json')
            res.json({ success: true, data: rows })
        } else {
            const headers = select.split(', ').map(h => h.includes(' as ') ? h.split(' as ')[1] : h.replace('m.', '').replace('c.', ''))
            const csvRows = [headers.join(',')]
            for (const r of rows) {
                const vals = headers.map(h => {
                    const v = r[h]
                    if (v === null || v === undefined) return ''
                    const s = v.toString()
                    return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s
                })
                csvRows.push(vals.join(','))
            }
            res.setHeader('Content-Type', 'text/csv; charset=utf-8')
            res.setHeader('Content-Disposition', `attachment; filename="scrna_umap_${new Date().toISOString().split('T')[0]}.csv"`)
            res.write('\uFEFF')
            res.end(csvRows.join('\n'))
        }
    } catch (e) {
        res.status(500).json({ success: false, message: 'Export failed', error: e.message })
    }
})

module.exports = router
