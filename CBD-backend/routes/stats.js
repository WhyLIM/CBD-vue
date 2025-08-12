const express = require('express');
const { query, get, run } = require('../config/database');
const router = express.Router();

// 获取总体统计信息
router.get('/', async (req, res) => {
  try {
    // 获取基础统计数据
    const stats = await get(`
      SELECT 
        COUNT(DISTINCT Biomarker) as total_biomarkers,
        COUNT(DISTINCT PMID) as total_articles,
        COUNT(DISTINCT Reference_first_author) as research_institutions
      FROM biomarker
    `);

    // 获取分类统计
    const categoryStats = await query(`
      SELECT 
        Category,
        COUNT(*) as count
      FROM biomarker 
      GROUP BY Category 
      ORDER BY count DESC
    `);

    // 获取年份分布
    const yearStats = await query(`
      SELECT 
        Reference_year as year,
        COUNT(*) as count
      FROM biomarker 
      WHERE Reference_year IS NOT NULL
      GROUP BY Reference_year 
      ORDER BY Reference_year DESC
      LIMIT 10
    `);

    // 获取应用类型统计
    const applicationStats = await query(`
      SELECT 
        Application,
        COUNT(*) as count
      FROM biomarker 
      WHERE Application IS NOT NULL AND Application != ''
      GROUP BY Application 
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: {
          totalBiomarkers: stats?.total_biomarkers || 0,
          totalArticles: stats?.total_articles || 0,
          researchInstitutions: stats?.research_institutions || 0,
          lastUpdated: stats?.last_updated
        },
        categories: categoryStats || [],
        yearDistribution: yearStats || [],
        applications: applicationStats || []
      }
    });

  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      error: '服务器内部错误',
      message: '获取统计信息失败'
    });
  }
});

// 获取数据趋势
router.get('/trends', async (req, res) => {
  try {
    // 模拟趋势数据
    const trendData = {
      monthly: [
        { month: '2024-01', count: 45 },
        { month: '2024-02', count: 52 },
        { month: '2024-03', count: 38 },
        { month: '2024-04', count: 61 },
        { month: '2024-05', count: 47 },
        { month: '2024-06', count: 55 }
      ],
      categories: [
        { category: 'Protein', trend: 'up', change: 12 },
        { category: 'MicroRNA', trend: 'up', change: 8 },
        { category: 'RNA', trend: 'stable', change: 2 },
        { category: 'DNA', trend: 'down', change: -3 }
      ]
    };

    res.json({
      success: true,
      data: trendData
    });

  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({
      error: '服务器内部错误',
      message: '获取趋势数据失败'
    });
  }
});

// 获取热门生物标记物
router.get('/popular', async (req, res) => {
  try {
    // 模拟热门数据（实际应该基于访问量或下载量）
    const popularBiomarkers = await query(`
      SELECT 
        id, name, category, application, 
        first_author, journal, publication_year
      FROM biomarker 
      ORDER BY name ASC 
      LIMIT 10
    `);

    res.json({
      success: true,
      data: popularBiomarkers
    });

  } catch (error) {
    console.error('获取热门生物标记物失败:', error);
    res.status(500).json({
      error: '服务器内部错误',
      message: '获取热门生物标记物失败'
    });
  }
});

// 获取最新添加的生物标记物
router.get('/recent', async (req, res) => {
  try {
    const recentBiomarkers = await query(`
      SELECT 
        ID, Biomarker, Category, Application, 
        Reference_first_author, Reference_journal, Reference_year
      FROM biomarker 
      ORDER BY Reference_year DESC 
      LIMIT 5
    `);

    res.json({
      success: true,
      data: recentBiomarkers
    });

  } catch (error) {
    console.error('获取最新生物标记物失败:', error);
    res.status(500).json({
      error: '服务器内部错误',
      message: '获取最新生物标记物失败'
    });
  }
});

module.exports = router;