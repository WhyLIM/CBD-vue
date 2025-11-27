const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, get, run } = require('../config/database');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
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

    const existingBiomarker = await get(
      'SELECT id FROM submissions WHERE biomarker_name = ? AND pmid = ?',
      [name, pmid]
    );

    if (existingBiomarker) {
      return res.status(409).json({
        error: 'Duplicate data',
        message: 'This biomarker already exists in the database'
      });
    }

    const result = await run(`
      INSERT INTO submissions (
        biomarker_name, category, application, location, description,
        pmid, submitter_name, submitter_email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      name, category, application, location, description,
      pmid, contributor, email
    ]);


    res.status(201).json({
      success: true,
      message: 'Biomarker data submitted successfully',
      data: {
        id: result.insertId,
        name,
        category,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('提交生物标记物数据失败:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit biomarker data'
    });
  }
});

// 获取提交历史（可选功能，用于管理员查看）
router.get('/history', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await get(
      'SELECT COUNT(*) as total FROM submissions'
    );
    const total = countResult.total;

    // 获取提交历史
    const rows = await query(`
      SELECT 
        id, biomarker_name as name, category, submitter_name as contributor, submitter_email as contributor_email,
        created_at, pmid
      FROM submissions 
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
      'SELECT ID as id, Biomarker as name FROM biomarker WHERE PMID = ?',
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
    const categories = await query(`
      SELECT DISTINCT Category as category 
      FROM biomarker 
      WHERE Category IS NOT NULL AND Category != ''
      ORDER BY Category
    `);

    // 获取现有的应用类型选项
    const applications = await query(`
      SELECT DISTINCT Application as application 
      FROM biomarker 
      WHERE Application IS NOT NULL AND Application != ''
      ORDER BY Application
    `);

    // 获取现有的位置选项
    const locations = await query(`
      SELECT DISTINCT Location as location 
      FROM biomarker 
      WHERE Location IS NOT NULL AND Location != ''
      ORDER BY Location
    `);

    // 获取现有的来源选项
    const sources = await query(`
      SELECT DISTINCT Source as source 
      FROM biomarker 
      WHERE Source IS NOT NULL AND Source != ''
      ORDER BY Source
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
