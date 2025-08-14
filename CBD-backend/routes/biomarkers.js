const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取生物标记物列表
router.get('/', async (req, res) => {
  try {
    console.log('收到生物标记物列表请求:', req.query);

    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      source = '',
      region = '',
      stage = '',
      sortBy = 'id',
      sortOrder = 'desc'
    } = req.query;

    // 参数验证
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // 构建查询条件
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push(`(
        Biomarker LIKE ? OR 
        Discription LIKE ? OR 
        Application LIKE ? OR 
        Reference_first_author LIKE ? OR 
        Reference_journal LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('Category = ?');
      queryParams.push(category);
    }

    if (source) {
      whereConditions.push('Source = ?');
      queryParams.push(source);
    }

    if (region) {
      whereConditions.push('Region = ?');
      queryParams.push(region);
    }

    if (stage) {
      whereConditions.push('Stage = ?');
      queryParams.push(stage);
    }

    const whereClause = whereConditions.length > 0 ?
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // 在路由/控制器层拆解参数
    const [sortField, sortDirection] = req.query.sort.split('_');

    const validSortFields = ['id', 'name', 'year'];
    const validSortOrders = ['asc', 'desc'];

    // 字段映射表（避免直接拼接SQL）
    const fieldMap = {
      id: 'ID',
      name: 'Biomarker',
      year: 'Reference_year'
    };

    // 验证并获取安全值
    const actualSortBy = fieldMap[validSortFields.includes(sortField) ? sortField : 'id'];
    const actualSortOrder = validSortOrders.includes(sortDirection) ? sortDirection.toUpperCase() : 'ASC';

    // 安全拼接SQL
    const orderClause = `ORDER BY ${actualSortBy} ${actualSortOrder}`;

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM biomarker ${whereClause}`;
    console.log('执行计数查询:', countQuery, '参数:', queryParams);
    const countResult = await db.query(countQuery, queryParams);
    console.log('计数查询结果:', countResult);
    const total = countResult[0]?.total || 0;
    console.log('总记录数:', total);

    // 获取数据列表
    const dataQuery = `
      SELECT 
        ID as id,
        Biomarker as biomarker,
        Category as category,
        String_Name as string_name,
        STRING_ID as string_id,
        Discription as description,
        Region as region,
        Race as race,
        Number as number,
        Male as male,
        Female as female,
        Age_Mean as age_mean,
        Age as age,
        Location as location,
        Stage as stage,
        Source as source,
        Experiment as experiment,
        Statictics as statistics,
        Application as application,
        Clinical_Use as clinical_use,
        Conclusion as conclusion,
        Reference_first_author as reference_first_author,
        Reference_journal as reference_journal,
        Reference_year as reference_year,
        PMID as pmid,
        Addition as addition,
        Target as target,
        Drugs as drugs
      FROM biomarker 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `;
    console.log('执行数据查询:', dataQuery, '参数:', [...queryParams, limitNum, offset]);
    const rows = await db.query(dataQuery, [...queryParams, limitNum, offset]);
    console.log('查询到的记录数:', rows.length);

    // 格式化数据 - 将数据转换为前端期望的格式
    const formattedData = rows.map(row => ({
      id: row.id,
      biomarker: row.biomarker,
      category: row.category,
      string_name: row.string_name,
      string_id: row.string_id,
      description: row.description,
      region: row.region,
      race: row.race,
      number: row.number,
      male: row.male,
      female: row.female,
      age_mean: row.age_mean,
      age: row.age,
      location: row.location,
      stage: row.stage,
      source: row.source,
      experiment: row.experiment,
      statistics: row.statistics,
      application: row.application,
      clinical_use: row.clinical_use,
      conclusion: row.conclusion,
      target: row.target,
      drugs: row.drugs,
      pmid: row.pmid,
      addition: row.addition,
      // 格式化引用信息
      reference: {
        author: row.reference_first_author,
        journal: row.reference_journal,
        year: row.reference_year
      }
    }));

    console.log('格式化后的数据示例:', formattedData[0]);

    // 计算分页信息
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const response = {
      success: true,
      data: formattedData,
      pagination: {
        current: pageNum,
        total: totalPages,
        limit: limitNum,
        count: total,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage
      },
      filters: {
        search,
        category,
        source,
        region,
        stage
      },
      sort: {
        by: sortBy,
        order: sortOrder
      }
    };

    console.log('返回响应:', {
      ...response,
      data: `${response.data.length} items`
    });

    res.json(response);

  } catch (error) {
    console.error('获取生物标记物列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取生物标记物列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 获取单个生物标记物详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('获取生物标记物详情:', id);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '无效的生物标记物ID'
      });
    }

    const query = `
      SELECT 
        ID as id,
        Biomarker as biomarker,
        Category as category,
        String_Name as string_name,
        STRING_ID as string_id,
        Discription as description,
        Region as region,
        Race as race,
        Number as number,
        Male as male,
        Female as female,
        \`Gender_M/F\` as gender_ratio,
        Age_Mean as age_mean,
        Age as age,
        Location as location,
        Stage as stage,
        Source as source,
        Experiment as experiment,
        Statictics as statistics,
        Application as application,
        Clinical_Use as clinical_use,
        Conclusion as conclusion,
        Reference_first_author as reference_first_author,
        Reference_journal as reference_journal,
        Reference_year as reference_year,
        PMID as pmid,
        Addition as addition,
        Target as target,
        Drugs as drugs
      FROM biomarker 
      WHERE ID = ?
    `;

    const result = await db.query(query, [id]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的生物标记物'
      });
    }

    const row = result[0];
    const biomarker = {
      id: row.id,
      biomarker: row.biomarker,
      category: row.category,
      string_name: row.string_name,
      string_id: row.string_id,
      description: row.description,
      region: row.region,
      race: row.race,
      number: row.number,
      male: row.male,
      female: row.female,
      gender_ratio: row.gender_ratio,
      age_mean: row.age_mean,
      age: row.age,
      location: row.location,
      stage: row.stage,
      source: row.source,
      experiment: row.experiment,
      statistics: row.statistics,
      application: row.application,
      clinical_use: row.clinical_use,
      conclusion: row.conclusion,
      target: row.target,
      drugs: row.drugs,
      pmid: row.pmid,
      addition: row.addition,
      reference: {
        author: row.reference_first_author,
        journal: row.reference_journal,
        year: row.reference_year
      }
    };

    console.log('返回生物标记物详情:', biomarker);

    res.json({
      success: true,
      data: biomarker
    });

  } catch (error) {
    console.error('获取生物标记物详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取生物标记物详情失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 获取筛选选项
router.get('/filters/options', async (req, res) => {
  try {
    console.log('获取筛选选项');

    const queries = {
      categories: 'SELECT DISTINCT Category as value FROM biomarker WHERE Category IS NOT NULL AND Category != "" ORDER BY Category',
      sources: 'SELECT DISTINCT Source as value FROM biomarker WHERE Source IS NOT NULL AND Source != "" ORDER BY Source',
      regions: 'SELECT DISTINCT Region as value FROM biomarker WHERE Region IS NOT NULL AND Region != "" ORDER BY Region',
      stages: 'SELECT DISTINCT Stage as value FROM biomarker WHERE Stage IS NOT NULL AND Stage != "" ORDER BY Stage',
      races: 'SELECT DISTINCT Race as value FROM biomarker WHERE Race IS NOT NULL AND Race != "" ORDER BY Race',
      experiments: 'SELECT DISTINCT Experiment as value FROM biomarker WHERE Experiment IS NOT NULL AND Experiment != "" ORDER BY Experiment'
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const rows = await db.query(query);
        results[key] = rows.map(row => row.value).filter(value => value && value.trim());
      } catch (error) {
        console.error(`获取${key}选项失败:`, error);
        results[key] = [];
      }
    }

    console.log('筛选选项结果:', results);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('获取筛选选项失败:', error);
    res.status(500).json({
      success: false,
      message: '获取筛选选项失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 获取统计信息
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('获取统计信息');

    const queries = {
      total: 'SELECT COUNT(*) as count FROM biomarker',
      categories: 'SELECT Category, COUNT(*) as count FROM biomarker WHERE Category IS NOT NULL GROUP BY Category ORDER BY count DESC',
      sources: 'SELECT Source, COUNT(*) as count FROM biomarker WHERE Source IS NOT NULL GROUP BY Source ORDER BY count DESC',
      regions: 'SELECT Region, COUNT(*) as count FROM biomarker WHERE Region IS NOT NULL GROUP BY Region ORDER BY count DESC',
      clinical_use: 'SELECT Clinical_Use, COUNT(*) as count FROM biomarker WHERE Clinical_Use IS NOT NULL GROUP BY Clinical_Use',
      targets: 'SELECT Target, COUNT(*) as count FROM biomarker WHERE Target IS NOT NULL GROUP BY Target'
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        const rows = await db.query(query);
        if (key === 'total') {
          results[key] = rows[0]?.count || 0;
        } else {
          results[key] = rows;
        }
      } catch (error) {
        console.error(`获取${key}统计失败:`, error);
        results[key] = key === 'total' ? 0 : [];
      }
    }

    console.log('统计信息结果:', results);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

module.exports = router;