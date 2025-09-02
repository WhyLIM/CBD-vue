const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, get, run } = require('../config/database');
const router = express.Router();

// 提交新的生物标记物数据
router.post('/', [
  body('name').notEmpty().withMessage('Biomarker name cannot be empty')
    .isLength({ max: 255 }).withMessage('Biomarker name cannot exceed 255 characters'),
  body('category').isIn(['Protein', 'RNA', 'CircRNA', 'LncRNA', 'MicroRNA', 'OtherRNA', 'DNA', 'Other'])
    .withMessage('Invalid biological category'),
  body('application').notEmpty().withMessage('Biomarker type cannot be empty')
    .isLength({ max: 500 }).withMessage('Application type cannot exceed 500 characters'),
  body('location').notEmpty().withMessage('Location cannot be empty')
    .isLength({ max: 255 }).withMessage('Location cannot exceed 255 characters'),
  body('contributor').notEmpty().withMessage('Contributor name cannot be empty')
    .isLength({ max: 255 }).withMessage('Contributor name cannot exceed 255 characters'),
  body('pmid').isInt({ min: 1, max: 99999999 }).withMessage('PubMed ID must be an integer between 1-99999999'),
  body('email').isEmail().withMessage('Invalid email format')
    .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),
  body('description').notEmpty().withMessage('Description cannot be empty')
    .isLength({ min: 10, max: 1000 }).withMessage('Description length must be between 10-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Data validation failed',
        details: errors.array()
      });
    }

    const {
      name, category, application, location, contributor,
      pmid, email, description
    } = req.body;

    // 检查是否已存在相同的生物标记物
    const existingBiomarker = await get(
      'SELECT id FROM biomarkers WHERE name = ? AND pmid = ?',
      [name, pmid]
    );

    if (existingBiomarker) {
      return res.status(409).json({
        error: 'Duplicate data',
        message: 'This biomarker already exists in the database'
      });
    }

    // 插入新的生物标记物数据
    const result = await run(`
      INSERT INTO biomarkers (
        name, category, application, location, description,
        pmid, contributor, contributor_email, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      name, category, application, location, description,
      pmid, contributor, email
    ]);

    // 更新统计数据
    await run(`
      UPDATE statistics 
      SET total_biomarkers = (SELECT COUNT(*) FROM biomarkers)
      WHERE id = 1
    `);

    res.status(201).json({
      success: true,
      message: 'Biomarker data submitted successfully',
      data: {
        id: result.lastID,
        name,
        category,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('提交生物标记物数据失败:', error);

    // 处理数据库约束错误
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({
        error: 'Duplicate data',
        message: 'This biomarker already exists in the database'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit biomarker data'
    });
  }
});

// 获取提交历史（可选功能，用于管理员查看）
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await get(
      'SELECT COUNT(*) as total FROM biomarkers WHERE contributor IS NOT NULL'
    );
    const total = countResult.total;

    // 获取提交历史
    const rows = await query(`
      SELECT 
        id, name, category, contributor, contributor_email,
        created_at, pmid
      FROM biomarkers 
      WHERE contributor IS NOT NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取提交历史失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get submission history'
    });
  }
});

// 验证PubMed ID是否有效（可选功能）
router.get('/validate-pmid/:pmid', async (req, res) => {
  try {
    const pmid = parseInt(req.params.pmid);

    if (!pmid || pmid <= 0) {
      return res.status(400).json({
        error: 'Invalid PubMed ID'
      });
    }

    // 检查数据库中是否已存在该PMID
    const existingBiomarker = await get(
      'SELECT id, name FROM biomarkers WHERE pmid = ?',
      [pmid]
    );

    if (existingBiomarker) {
      return res.json({
        success: true,
        exists: true,
        message: 'This PubMed ID already exists in the database',
        existingBiomarker: {
          id: existingBiomarker.id,
          name: existingBiomarker.name
        }
      });
    }

    // 这里可以添加调用PubMed API验证PMID的逻辑
    // 目前简单返回不存在的状态
    res.json({
      success: true,
      exists: false,
      message: 'PubMed ID is available'
    });

  } catch (error) {
    console.error('验证PubMed ID失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate PubMed ID'
    });
  }
});

// 获取提交表单的选项数据
router.get('/form-options', async (req, res) => {
  try {
    // 获取现有的分类选项
    const categories = await query(`
      SELECT DISTINCT category 
      FROM biomarkers 
      WHERE category IS NOT NULL 
      ORDER BY category
    `);

    // 获取现有的应用类型选项
    const applications = await query(`
      SELECT DISTINCT application 
      FROM biomarkers 
      WHERE application IS NOT NULL AND application != ''
      ORDER BY application
    `);

    // 获取现有的位置选项
    const locations = await query(`
      SELECT DISTINCT location 
      FROM biomarkers 
      WHERE location IS NOT NULL AND location != ''
      ORDER BY location
    `);

    // 获取现有的来源选项
    const sources = await query(`
      SELECT DISTINCT source 
      FROM biomarkers 
      WHERE source IS NOT NULL AND source != ''
      ORDER BY source
    `);

    res.json({
      success: true,
      data: {
        categories: categories.map(row => row.category),
        applications: applications.map(row => row.application),
        locations: locations.map(row => row.location),
        sources: sources.map(row => row.source)
      }
    });

  } catch (error) {
    console.error('获取表单选项失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get form options'
    });
  }
});

module.exports = router;