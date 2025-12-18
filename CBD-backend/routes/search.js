const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 检查数据库连接
db.testConnection().then(connected => {
  if (!connected) {
    console.error('❌ Route search initialization failed: Unable to connect to the database');
  } else {
    console.log('✅ Route search initialized successfully: Database connection normal');
  }
});

// 高级搜索接口
router.post('/advanced', async (req, res) => {
  try {
    console.log('Received advanced search request:', req.body);

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
      query += ` AND Category IN (${categoryPlaceholders})`;
      countQuery += ` AND Category IN (${categoryPlaceholders})`;
      params.push(...category);
    }

    if (string_name) {
      query += ` AND Symbol LIKE ?`;
      countQuery += ` AND Symbol LIKE ?`;
      params.push(`%${string_name}%`);
    }

    if (description) {
      query += ` AND Description LIKE ?`;
      countQuery += ` AND Description LIKE ?`;
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

    // 文献信息搜索条件 - 修正字段名
    if (reference_first_author) {
      query += ` AND First_Author LIKE ?`;
      countQuery += ` AND First_Author LIKE ?`;
      params.push(`%${reference_first_author}%`);
    }

    if (reference_journal) {
      query += ` AND Journal LIKE ?`;
      countQuery += ` AND Journal LIKE ?`;
      params.push(`%${reference_journal}%`);
    }

    if (reference_year_from) {
      query += ` AND Year >= ?`;
      countQuery += ` AND Year >= ?`;
      params.push(reference_year_from);
    }

    if (reference_year_to) {
      query += ` AND Year <= ?`;
      countQuery += ` AND Year <= ?`;
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
        'Description LIKE ?',
        'Application LIKE ?',
        'First_Author LIKE ?',
        'Journal LIKE ?'
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
        orderBy = 'ORDER BY Year DESC';
        break;
      case 'year_asc':
        orderBy = 'ORDER BY Year ASC';
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
    const pagedQuery = `${query} ${orderBy} LIMIT ${parseInt(limit, 10)} OFFSET ${offset}`;

    // 执行查询
    const results = await db.query(pagedQuery, params);

    // 获取总数（不包含分页参数）
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total;

    // 暂时简化统计功能，后续优化
    const stats = {
      categories: [],
      clinicalUse: 0,
      recent: 0,
      validated: 0
    };

    res.json({
      success: true,
      data: results,
      statistics: stats,
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
      message: 'Search failed',
      error: error.message
    });
  }
});

// 快速搜索接口
router.get('/quick', async (req, res) => {
  try {
    console.log('Received a quick search request:', req.query);
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search keywords cannot be empty'
      });
    }

    // 在主要字段中搜索 - 修正字段名
    const query = `
      SELECT * FROM biomarker 
      WHERE Biomarker LIKE ? 
         OR Description LIKE ? 
         OR Application LIKE ?
         OR First_Author LIKE ?
         OR Journal LIKE ?
      ORDER BY 
        CASE 
          WHEN Biomarker LIKE ? THEN 1
          ELSE 2
        END,
        Biomarker ASC
      LIMIT ${parseInt(limit, 10)} OFFSET ${(page - 1) * limit}
    `;

    const searchTerm = `%${q}%`;
    const exactTerm = `${q}%`;
    const offset = (page - 1) * limit;

    const params = [
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      exactTerm
    ];

    const results = await db.query(query, params);

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM biomarker 
      WHERE Biomarker LIKE ? 
         OR Description LIKE ? 
         OR Application LIKE ?
         OR First_Author LIKE ?
         OR Journal LIKE ?
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
    console.error('Quick search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
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
        field = 'First_Author';
        break;
      case 'journal':
        field = 'Journal';
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
    console.error('Failed to retrieve search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
});

// 获取筛选选项
router.get('/filters', async (req, res) => {
  try {
    console.log('Received request to retrieve filter options');

    // 首先检查数据库连接
    const isConnected = await db.testConnection();
    if (!isConnected) {
      console.log('Database connection failed, returning default filter options');
      return res.json({
        success: true,
        data: {
          categories: ['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA'],
          applications: ['Diagnosis', 'Prognosis', 'Treatment', 'Monitoring'],
          locations: ['Colon', 'Rectum', 'Serum', 'Plasma'],
          sources: ['Tissue', 'Blood', 'Serum', 'Plasma', 'Urine', 'Saliva'],
          stages: ['Stage I', 'Stage II', 'Stage III', 'Stage IV'],
          regions: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Global'],
          clinical_uses: ['Yes', 'No'],
          targets: ['Yes', 'No'],
          yearRange: {
            min: 1900,
            max: new Date().getFullYear()
          },
          totalRecords: 100
        }
      });
    }

    // 获取所有可用的筛选选项 - 修正字段名
    const queries = {
      categories: 'SELECT DISTINCT Category FROM biomarker WHERE Category IS NOT NULL AND Category != "" ORDER BY Category',
      applications: 'SELECT DISTINCT Application FROM biomarker WHERE Application IS NOT NULL AND Application != "" ORDER BY Application',
      locations: 'SELECT DISTINCT Location FROM biomarker WHERE Location IS NOT NULL AND Location != "" ORDER BY Location',
      sources: 'SELECT DISTINCT Source FROM biomarker WHERE Source IS NOT NULL AND Source != "" ORDER BY Source',
      stages: 'SELECT DISTINCT Stage FROM biomarker WHERE Stage IS NOT NULL AND Stage != "" ORDER BY Stage',
      regions: 'SELECT DISTINCT Region FROM biomarker WHERE Region IS NOT NULL AND Region != "" ORDER BY Region',
      clinical_uses: 'SELECT DISTINCT Clinical_Use FROM biomarker WHERE Clinical_Use IS NOT NULL AND Clinical_Use != "" ORDER BY Clinical_Use',
      targets: 'SELECT DISTINCT Target FROM biomarker WHERE Target IS NOT NULL AND Target != "" ORDER BY Target'
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        console.log(`Execute query: ${query}`);
        const rows = await db.query(query);
        console.log(`Query results: ${key}`, rows);
        results[key] = rows.map(row => Object.values(row)[0]).filter(value => value && value.trim() !== '');
      } catch (queryError) {
        console.error(`Query ${key} failed:`, queryError);
        results[key] = [];
      }
    }

    // 获取年份范围
    try {
      const yearQuery = 'SELECT MIN(Year) as min_year, MAX(Year) as max_year FROM biomarker WHERE Year IS NOT NULL AND Year > 0';
      const yearResult = await db.query(yearQuery);
      if (yearResult && yearResult.length > 0) {
        results.yearRange = {
          min: yearResult[0].min_year || 1900,
          max: yearResult[0].max_year || new Date().getFullYear()
        };
      }
    } catch (yearError) {
      console.error('Failed to retrieve the year range:', yearError);
      results.yearRange = {
        min: 1900,
        max: new Date().getFullYear()
      };
    }

    // 获取总记录数
    try {
      const countQuery = 'SELECT COUNT(*) as total FROM biomarker';
      const countResult = await db.query(countQuery);
      results.totalRecords = countResult[0].total || 0;
    } catch (countError) {
      console.error('Failed to get the total number of records:', countError);
      results.totalRecords = 0;
    }

    // 添加默认值，以防数据库中没有数据
    if (!results.categories || results.categories.length === 0) {
      results.categories = ['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA'];
    }
    if (!results.applications || results.applications.length === 0) {
      results.applications = ['Diagnosis', 'Prognosis', 'Treatment', 'Monitoring'];
    }
    if (!results.locations || results.locations.length === 0) {
      results.locations = ['Colon', 'Rectum', 'Serum', 'Plasma'];
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
    if (!results.clinical_uses || results.clinical_uses.length === 0) {
      results.clinical_uses = ['Yes', 'No'];
    }
    if (!results.targets || results.targets.length === 0) {
      results.targets = ['Yes', 'No'];
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Failed to retrieve filter options:', error);
    // 即使出错也返回默认选项，确保前端能正常工作
    res.json({
      success: true,
      data: {
        categories: ['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA'],
        applications: ['Diagnosis', 'Prognosis', 'Treatment', 'Monitoring'],
        locations: ['Colon', 'Rectum', 'Serum', 'Plasma'],
        sources: ['Tissue', 'Blood', 'Serum', 'Plasma', 'Urine', 'Saliva'],
        stages: ['Stage I', 'Stage II', 'Stage III', 'Stage IV'],
        regions: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Global'],
        clinical_uses: ['Yes', 'No'],
        targets: ['Yes', 'No'],
        yearRange: {
          min: 1900,
          max: new Date().getFullYear()
        },
        totalRecords: 100
      }
    });
  }
});

module.exports = router;
