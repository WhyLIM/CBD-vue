const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 检查数据库连接
db.testConnection().then(connected => {
  if (!connected) {
    console.error('❌ 搜索路由初始化失败: 无法连接到数据库');
  } else {
    console.log('✅ 搜索路由初始化成功: 数据库连接正常');
  }
});

// 高级搜索接口
router.post('/advanced', async (req, res) => {
  try {
    console.log('接收到高级搜索请求:', req.body);

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

    // 基本信息搜索条件 - 修正字段名
    if (biomarker) {
      query += ` AND Biomarker LIKE ?`;
      countQuery += ` AND Biomarker LIKE ?`;
      params.push(`%${biomarker}%`);
    }

    if (category && category.length > 0) {
      const categoryPlaceholders = category.map(() => '?').join(',');
      query += ` AND category IN (${categoryPlaceholders})`;
      countQuery += ` AND category IN (${categoryPlaceholders})`;
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
      // 假设没有race字段，可能需要添加
      // query += ` AND race LIKE ?`;
      // countQuery += ` AND race LIKE ?`;
      // params.push(`%${race}%`);
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
      // 假设没有experiment字段，可能需要添加
      // query += ` AND experiment LIKE ?`;
      // countQuery += ` AND experiment LIKE ?`;
      // params.push(`%${experiment}%`);
    }

    if (application) {
      query += ` AND Application LIKE ?`;
      countQuery += ` AND Application LIKE ?`;
      params.push(`%${application}%`);
    }

    if (clinical_use !== undefined && clinical_use !== '') {
      // 假设没有clinical_use字段，可能需要添加
      // query += ` AND clinical_use = ?`;
      // countQuery += ` AND clinical_use = ?`;
      // params.push(clinical_use);
    }

    if (target !== undefined && target !== '') {
      // 假设没有target字段，可能需要添加
      // query += ` AND target = ?`;
      // countQuery += ` AND target = ?`;
      // params.push(target);
    }

    if (drugs) {
      // 假设没有drugs字段，可能需要添加
      // query += ` AND drugs LIKE ?`;
      // countQuery += ` AND drugs LIKE ?`;
      // params.push(`%${drugs}%`);
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

    // 文献信息搜索条件 - 修正字段名
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

    // 关键词搜索（在多个字段中搜索）- 修正字段名
    if (keywords) {
      const keywordConditions = [
        'Biomarker LIKE ?',
        'Discription LIKE ?',
        'Application LIKE ?',
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

    // 排序 - 修正字段名
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
    const results = await db.query(query, params);

    // 获取总数（不包含分页参数）
    const countParams = params.slice(0, -2); // 移除 limit 和 offset 参数
    const countResult = await db.query(countQuery, countParams);
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
    console.log('接收到快速搜索请求:', req.query);
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    // 在主要字段中搜索 - 修正字段名
    const query = `
      SELECT * FROM biomarker 
      WHERE Biomarker LIKE ? 
         OR Discription LIKE ? 
         OR Application LIKE ?
         OR Reference_first_author LIKE ?
         OR Reference_journal LIKE ?
      ORDER BY 
        CASE 
          WHEN Biomarker LIKE ? THEN 1
          ELSE 2
        END,
        Biomarker ASC
      LIMIT ? OFFSET ?
    `;

    const searchTerm = `%${q}%`;
    const exactTerm = `${q}%`;
    const offset = (page - 1) * limit;

    const params = [
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      exactTerm,
      parseInt(limit), parseInt(offset)
    ];

    const results = await db.query(query, params);

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM biomarker 
      WHERE Biomarker LIKE ? 
         OR Discription LIKE ? 
         OR Application LIKE ?
         OR Reference_first_author LIKE ?
         OR Reference_journal LIKE ?
    `;

    const countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
    const countResult = await db.query(countQuery, countParams);
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

    const results = await db.query(query, [`${q}%`]);

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
    console.log('接收到获取筛选选项请求');

    // 获取所有可用的筛选选项 - 修正字段名
    const queries = {
      categories: 'SELECT DISTINCT category FROM biomarker WHERE category IS NOT NULL AND category != "" ORDER BY category',
      sources: 'SELECT DISTINCT source FROM biomarker WHERE source IS NOT NULL AND source != "" ORDER BY source',
      stages: 'SELECT DISTINCT stage FROM biomarker WHERE stage IS NOT NULL AND stage != "" ORDER BY stage',
      regions: 'SELECT DISTINCT region FROM biomarker WHERE region IS NOT NULL AND region != "" ORDER BY region'
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        console.log(`执行查询: ${query}`);
        const rows = await db.query(query);
        console.log(`查询结果: ${key}`, rows);
        results[key] = rows.map(row => Object.values(row)[0]);
      } catch (queryError) {
        console.error(`查询 ${key} 失败:`, queryError);
        results[key] = [];
      }
    }

    // 添加默认值，以防数据库中没有数据
    if (!results.categories || results.categories.length === 0) {
      results.categories = ['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA'];
    }
    if (!results.sources || results.sources.length === 0) {
      results.sources = ['Tissue', 'Blood', 'Serum', 'Plasma', 'Urine', 'Saliva'];
    }
    if (!results.stages || results.stages.length === 0) {
      results.stages = ['Stage I', 'Stage II', 'Stage III', 'Stage IV'];
    }
    if (!results.regions || results.regions.length === 0) {
      results.regions = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Global'];
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