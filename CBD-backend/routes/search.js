const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 高级搜索接口
router.post('/advanced', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'relevance',
      // 基本信息搜索条件
      biomarker,
      category,
      string_name,
      description,
      region,
      race,
      location,
      stage,
      source,
      experiment,
      application,
      clinical_use,
      target,
      drugs,
      // 样本信息搜索条件
      number_min,
      number_max,
      male_min,
      male_max,
      female_min,
      female_max,
      age_mean_min,
      age_mean_max,
      age_min,
      age_max,
      // 文献信息搜索条件
      reference_first_author,
      reference_journal,
      reference_year_from,
      reference_year_to,
      pmid,
      // 关键词搜索
      keywords
    } = req.body;

    // 构建基础查询
    let query = 'SELECT * FROM biomarker WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM biomarker WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // 基本信息搜索条件
    if (biomarker) {
      query += ` AND Biomarker LIKE ?`;
      countQuery += ` AND Biomarker LIKE ?`;
      params.push(`%${biomarker}%`);
    }

    if (category && category.length > 0) {
      const categoryPlaceholders = category.map(() => '?').join(',');
      query += ` AND Category IN (${categoryPlaceholders})`;
      countQuery += ` AND Category IN (${categoryPlaceholders})`;
      params.push(...category);
    }

    if (string_name) {
      query += ` AND String_Name LIKE ?`;
      countQuery += ` AND String_Name LIKE ?`;
      params.push(`%${string_name}%`);
    }

    if (description) {
      query += ` AND Discription LIKE ?`;
      countQuery += ` AND Discription LIKE ?`;
      params.push(`%${description}%`);
    }

    if (region) {
      query += ` AND Region LIKE ?`;
      countQuery += ` AND Region LIKE ?`;
      params.push(`%${region}%`);
    }

    if (race) {
      query += ` AND Race LIKE ?`;
      countQuery += ` AND Race LIKE ?`;
      params.push(`%${race}%`);
    }

    if (location) {
      query += ` AND Location LIKE ?`;
      countQuery += ` AND Location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (stage) {
      query += ` AND Stage LIKE ?`;
      countQuery += ` AND Stage LIKE ?`;
      params.push(`%${stage}%`);
    }

    if (source) {
      query += ` AND Source LIKE ?`;
      countQuery += ` AND Source LIKE ?`;
      params.push(`%${source}%`);
    }

    if (experiment) {
      query += ` AND Experiment LIKE ?`;
      countQuery += ` AND Experiment LIKE ?`;
      params.push(`%${experiment}%`);
    }

    if (application) {
      query += ` AND Application LIKE ?`;
      countQuery += ` AND Application LIKE ?`;
      params.push(`%${application}%`);
    }

    if (clinical_use !== undefined && clinical_use !== '') {
      query += ` AND Clinical_Use = ?`;
      countQuery += ` AND Clinical_Use = ?`;
      params.push(clinical_use);
    }

    if (target !== undefined && target !== '') {
      query += ` AND Target = ?`;
      countQuery += ` AND Target = ?`;
      params.push(target);
    }

    if (drugs) {
      query += ` AND Drugs LIKE ?`;
      countQuery += ` AND Drugs LIKE ?`;
      params.push(`%${drugs}%`);
    }

    // 样本信息数值范围搜索
    if (number_min !== undefined && number_min !== '') {
      query += ` AND Number >= ?`;
      countQuery += ` AND Number >= ?`;
      params.push(number_min);
    }

    if (number_max !== undefined && number_max !== '') {
      query += ` AND Number <= ?`;
      countQuery += ` AND Number <= ?`;
      params.push(number_max);
    }

    if (male_min !== undefined && male_min !== '') {
      query += ` AND Male >= ?`;
      countQuery += ` AND Male >= ?`;
      params.push(male_min);
    }

    if (male_max !== undefined && male_max !== '') {
      query += ` AND Male <= ?`;
      countQuery += ` AND Male <= ?`;
      params.push(male_max);
    }

    if (female_min !== undefined && female_min !== '') {
      query += ` AND Female >= ?`;
      countQuery += ` AND Female <= ?`;
      params.push(female_min);
    }

    if (female_max !== undefined && female_max !== '') {
      query += ` AND Female <= ?`;
      countQuery += ` AND Female <= ?`;
      params.push(female_max);
    }

    if (age_mean_min !== undefined && age_mean_min !== '') {
      query += ` AND Age_Mean >= ?`;
      countQuery += ` AND Age_Mean >= ?`;
      params.push(age_mean_min);
    }

    if (age_mean_max !== undefined && age_mean_max !== '') {
      query += ` AND Age_Mean <= ?`;
      countQuery += ` AND Age_Mean <= ?`;
      params.push(age_mean_max);
    }

    if (age_min !== undefined && age_min !== '') {
      query += ` AND Age >= ?`;
      countQuery += ` AND Age >= ?`;
      params.push(age_min);
    }

    if (age_max !== undefined && age_max !== '') {
      query += ` AND Age <= ?`;
      countQuery += ` AND Age <= ?`;
      params.push(age_max);
    }

    // 文献信息搜索条件
    if (reference_first_author) {
      query += ` AND Reference_first_author LIKE ?`;
      countQuery += ` AND Reference_first_author LIKE ?`;
      params.push(`%${reference_first_author}%`);
    }

    if (reference_journal) {
      query += ` AND Reference_journal LIKE ?`;
      countQuery += ` AND Reference_journal LIKE ?`;
      params.push(`%${reference_journal}%`);
    }

    if (reference_year_from) {
      query += ` AND Reference_year >= ?`;
      countQuery += ` AND Reference_year >= ?`;
      params.push(reference_year_from);
    }

    if (reference_year_to) {
      query += ` AND Reference_year <= ?`;
      countQuery += ` AND Reference_year <= ?`;
      params.push(reference_year_to);
    }

    if (pmid) {
      query += ` AND PMID LIKE ?`;
      countQuery += ` AND PMID LIKE ?`;
      params.push(`%${pmid}%`);
    }

    // 关键词搜索（在多个字段中搜索）
    if (keywords) {
      const keywordConditions = [
        'Biomarker LIKE ?',
        'String_Name LIKE ?',
        'Discription LIKE ?',
        'Application LIKE ?',
        'Conclusion LIKE ?',
        'Reference_first_author LIKE ?',
        'Reference_journal LIKE ?'
      ];
      query += ` AND (${keywordConditions.join(' OR ')})`;
      countQuery += ` AND (${keywordConditions.join(' OR ')})`;

      // 为每个字段添加关键词参数
      for (let i = 0; i < keywordConditions.length; i++) {
        params.push(`%${keywords}%`);
      }
    }

    // 排序
    let orderBy = '';
    switch (sort) {
      case 'biomarker_asc':
        orderBy = 'ORDER BY Biomarker ASC';
        break;
      case 'biomarker_desc':
        orderBy = 'ORDER BY Biomarker DESC';
        break;
      case 'year_desc':
        orderBy = 'ORDER BY Reference_year DESC';
        break;
      case 'year_asc':
        orderBy = 'ORDER BY Reference_year ASC';
        break;
      case 'number_desc':
        orderBy = 'ORDER BY Number DESC';
        break;
      case 'number_asc':
        orderBy = 'ORDER BY Number ASC';
        break;
      default:
        orderBy = 'ORDER BY ID ASC';
    }

    // 分页
    const offset = (page - 1) * limit;
    query += ` ${orderBy} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // 执行查询
    const [results] = await db.execute(query, params);

    // 获取总数（不包含分页参数）
    const countParams = params.slice(0, -2); // 移除 limit 和 offset 参数
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('高级搜索错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error.message
    });
  }
});

// 快速搜索接口
router.get('/quick', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    // 在主要字段中搜索
    const query = `
      SELECT * FROM biomarker 
      WHERE Biomarker LIKE ? 
         OR String_Name LIKE ? 
         OR Discription LIKE ? 
         OR Application LIKE ?
         OR Reference_first_author LIKE ?
         OR Reference_journal LIKE ?
      ORDER BY 
        CASE 
          WHEN Biomarker LIKE ? THEN 1
          WHEN String_Name LIKE ? THEN 2
          ELSE 3
        END,
        Biomarker ASC
      LIMIT ? OFFSET ?
    `;

    const searchTerm = `%${q}%`;
    const exactTerm = `${q}%`;
    const offset = (page - 1) * limit;

    const params = [
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      exactTerm, exactTerm,
      parseInt(limit), parseInt(offset)
    ];

    const [results] = await db.execute(query, params);

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM biomarker 
      WHERE Biomarker LIKE ? 
         OR String_Name LIKE ? 
         OR Discription LIKE ? 
         OR Application LIKE ?
         OR Reference_first_author LIKE ?
         OR Reference_journal LIKE ?
    `;

    const countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('快速搜索错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error.message
    });
  }
});

// 获取搜索建议
router.get('/suggestions', async (req, res) => {
  try {
    const { q, type = 'biomarker' } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: []
      });
    }

    let query = '';
    let field = '';

    switch (type) {
      case 'biomarker':
        field = 'Biomarker';
        break;
      case 'category':
        field = 'Category';
        break;
      case 'author':
        field = 'Reference_first_author';
        break;
      case 'journal':
        field = 'Reference_journal';
        break;
      default:
        field = 'Biomarker';
    }

    query = `
      SELECT DISTINCT ${field} as suggestion 
      FROM biomarker 
      WHERE ${field} LIKE ? 
        AND ${field} IS NOT NULL 
        AND ${field} != ''
      ORDER BY ${field} ASC 
      LIMIT 10
    `;

    const [results] = await db.execute(query, [`${q}%`]);

    res.json({
      success: true,
      data: results.map(row => row.suggestion)
    });

  } catch (error) {
    console.error('获取搜索建议错误:', error);
    res.status(500).json({
      success: false,
      message: '获取建议失败',
      error: error.message
    });
  }
});

// 获取筛选选项
router.get('/filters', async (req, res) => {
  try {
    // 获取所有可用的筛选选项
    const queries = {
      categories: 'SELECT DISTINCT Category FROM biomarker WHERE Category IS NOT NULL AND Category != "" ORDER BY Category',
      sources: 'SELECT DISTINCT Source FROM biomarker WHERE Source IS NOT NULL AND Source != "" ORDER BY Source',
      stages: 'SELECT DISTINCT Stage FROM biomarker WHERE Stage IS NOT NULL AND Stage != "" ORDER BY Stage',
      experiments: 'SELECT DISTINCT Experiment FROM biomarker WHERE Experiment IS NOT NULL AND Experiment != "" ORDER BY Experiment',
      regions: 'SELECT DISTINCT Region FROM biomarker WHERE Region IS NOT NULL AND Region != "" ORDER BY Region',
      races: 'SELECT DISTINCT Race FROM biomarker WHERE Race IS NOT NULL AND Race != "" ORDER BY Race'
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      const [rows] = await db.execute(query);
      results[key] = rows.map(row => Object.values(row)[0]);
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('获取筛选选项错误:', error);
    res.status(500).json({
      success: false,
      message: '获取筛选选项失败',
      error: error.message
    });
  }
});

module.exports = router;