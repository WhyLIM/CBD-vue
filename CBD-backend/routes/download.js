const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query, get, run } = require('../config/database');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// 记录下载日志的辅助函数
const logDownload = async (filename, downloadType, filters, fileSize, req) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    await run(`
      INSERT INTO download_logs (file_name, download_type, file_size, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [filename, downloadType, fileSize, ipAddress, userAgent]);
  } catch (error) {
    console.error('记录下载日志失败:', error);
  }
};

// 生成CSV格式数据
const generateCSV = (data) => {
  if (!data || data.length === 0) {
    return 'No data available';
  }

  const headers = [
    'ID', 'Name', 'Category', 'Application', 'Location', 'Source',
    'Description', 'PMID', 'First Author', 'Journal', 'Publication Year',
    'Region', 'Stage', 'Contributor', 'Contributor Email', 'Created At'
  ];

  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = [
      row.id || '',
      `"${(row.name || '').replace(/"/g, '""')}"`,
      `"${(row.category || '').replace(/"/g, '""')}"`,
      `"${(row.application || '').replace(/"/g, '""')}"`,
      `"${(row.location || '').replace(/"/g, '""')}"`,
      `"${(row.source || '').replace(/"/g, '""')}"`,
      `"${(row.description || '').replace(/"/g, '""')}"`,
      row.pmid || '',
      `"${(row.first_author || '').replace(/"/g, '""')}"`,
      `"${(row.journal || '').replace(/"/g, '""')}"`,
      row.publication_year || '',
      `"${(row.region || '').replace(/"/g, '""')}"`,
      `"${(row.stage || '').replace(/"/g, '""')}"`,
      `"${(row.contributor || '').replace(/"/g, '""')}"`,
      `"${(row.contributor_email || '').replace(/"/g, '""')}"`,
      `"${(row.created_at || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

// 下载完整数据集
router.get('/complete', async (req, res) => {
  try {
    // 获取所有生物标记物数据
    const rows = await query(`
      SELECT 
        ID as id,
        Biomarker as name,
        Category as category,
        Application as application,
        Location as location,
        Source as source,
        Discription as description,
        PMID as pmid,
        Reference_first_author as first_author,
        Reference_journal as journal,
        Reference_year as publication_year,
        Region as region,
        Stage as stage
      FROM biomarker ORDER BY Biomarker ASC
    `);

    const csvData = generateCSV(rows);
    const filename = `CBD2_Complete_Dataset_${new Date().toISOString().split('T')[0]}.csv`;

    // 记录下载日志
    await logDownload(filename, 'complete', null, Buffer.byteLength(csvData, 'utf8'), req);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);

  } catch (error) {
    console.error('下载完整数据集失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to download complete dataset'
    });
  }
});

// 自定义下载（根据筛选条件）
router.post('/custom', [
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parameter validation failed',
        details: errors.array()
      });
    }

    const { filters = {}, format = 'csv' } = req.body;

    let whereClause = '';
    let queryParams = [];

    // 构建WHERE条件
    const conditions = [];

    if (filters.category && filters.category !== 'all') {
      conditions.push('category = ?');
      queryParams.push(filters.category);
    }

    if (filters.application) {
      conditions.push('application LIKE ?');
      queryParams.push(`%${filters.application}%`);
    }

    if (filters.location) {
      conditions.push('location LIKE ?');
      queryParams.push(`%${filters.location}%`);
    }

    if (filters.source) {
      conditions.push('source LIKE ?');
      queryParams.push(`%${filters.source}%`);
    }

    if (filters.yearFrom) {
      conditions.push('publication_year >= ?');
      queryParams.push(parseInt(filters.yearFrom));
    }

    if (filters.yearTo) {
      conditions.push('publication_year <= ?');
      queryParams.push(parseInt(filters.yearTo));
    }

    if (filters.region) {
      conditions.push('region LIKE ?');
      queryParams.push(`%${filters.region}%`);
    }

    if (filters.stage) {
      conditions.push('stage LIKE ?');
      queryParams.push(`%${filters.stage}%`);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // 执行查询
    const rows = await query(`
      SELECT 
        ID as id,
        Biomarker as name,
        Category as category,
        Application as application,
        Location as location,
        Source as source,
        Discription as description,
        PMID as pmid,
        Reference_first_author as first_author,
        Reference_journal as journal,
        Reference_year as publication_year,
        Region as region,
        Stage as stage
      FROM biomarker ${whereClause} ORDER BY Biomarker ASC
    `, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No data found matching the criteria',
        message: 'Please adjust the filter conditions and try again'
      });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let responseData, filename, contentType;

    if (format === 'json') {
      responseData = JSON.stringify(rows, null, 2);
      filename = `CBD2_Custom_Dataset_${timestamp}.json`;
      contentType = 'application/json';
    } else {
      responseData = generateCSV(rows);
      filename = `CBD2_Custom_Dataset_${timestamp}.csv`;
      contentType = 'text/csv';
    }

    // 记录下载日志
    await logDownload(filename, 'filtered', filters, Buffer.byteLength(responseData, 'utf8'), req);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(responseData);

  } catch (error) {
    console.error('自定义下载失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Custom download failed'
    });
  }
});

// 获取下载统计信息
router.get('/stats', async (req, res) => {
  try {
    const totalDownloadsRow = await get(`
      SELECT COUNT(*) as total FROM download_logs
    `);
    const monthlyDownloadsRow = await get(`
      SELECT COUNT(*) as total FROM download_logs WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);
    const lastUpdatedRow = await get(`
      SELECT MAX(created_at) as last_updated FROM download_logs
    `);

    const recentDownloads = await query(`
      SELECT 
        file_name as filename,
        download_type,
        created_at
      FROM download_logs 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalDownloads: totalDownloadsRow?.total || 0,
        monthlyDownloads: monthlyDownloadsRow?.total || 0,
        lastUpdated: lastUpdatedRow?.last_updated,
        recentDownloads: recentDownloads || []
      }
    });

  } catch (error) {
    console.error('获取下载统计失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get download statistics'
    });
  }
});

module.exports = router;
