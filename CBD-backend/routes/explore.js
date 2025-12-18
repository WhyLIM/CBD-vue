const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, get, run } = require('../config/database');
const router = express.Router();

// 网络分析
router.post('/network', [
  body('proteins').isArray().withMessage('Protein list must be an array'),
  body('species').optional().isString().withMessage('Species must be a string'),
  body('confidence').optional().isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0-1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parameter validation failed',
        details: errors.array()
      });
    }

    const { proteins, species = 'homo sapiens', confidence = 0.4 } = req.body;

    if (!proteins || proteins.length === 0) {
      return res.status(400).json({
        error: 'Protein list cannot be empty'
      });
    }

    // 模拟STRING API调用
    const mockNetworkData = {
      nodes: proteins.map((protein, index) => ({
        id: protein,
        name: protein,
        type: 'protein',
        score: Math.random() * 0.6 + 0.4
      })),
      edges: [],
      nodeCount: proteins.length,
      edgeCount: 0,
      species,
      confidence
    };

    // 生成模拟的边连接
    for (let i = 0; i < proteins.length; i++) {
      for (let j = i + 1; j < proteins.length; j++) {
        if (Math.random() > 0.7) { // 30%的概率生成连接
          const score = Math.random() * 0.6 + 0.4;
          mockNetworkData.edges.push({
            source: proteins[i],
            target: proteins[j],
            score: score,
            type: 'interaction'
          });
          mockNetworkData.edgeCount++;
        }
      }
    }

    // 记录分析日志
    try {
      await run(`
        INSERT INTO analysis_logs (analysis_type, input_data, parameters, result_summary, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [
        'network_analysis',
        JSON.stringify({ proteins: proteins }),
        JSON.stringify({ species, confidence }),
        JSON.stringify({ nodeCount: mockNetworkData.nodeCount, edgeCount: mockNetworkData.edgeCount })
      ]);
    } catch (logError) {
      console.error('记录分析日志失败:', logError);
    }

    res.json({
      success: true,
      data: mockNetworkData
    });

  } catch (error) {
    console.error('网络分析失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Network analysis failed'
    });
  }
});

// 富集分析
router.post('/enrichment', [
  body('genes').isArray().withMessage('Gene list must be an array'),
  body('analysisType').optional().isIn(['GO', 'KEGG', 'Reactome']).withMessage('Invalid analysis type'),
  body('pValue').optional().isFloat({ min: 0, max: 1 }).withMessage('P-value must be between 0-1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '参数验证失败',
        details: errors.array()
      });
    }

    const { genes, analysisType = 'GO', pValue = 0.05 } = req.body;

    if (!genes || genes.length === 0) {
      return res.status(400).json({
        error: 'Gene list cannot be empty'
      });
    }

    // 模拟富集分析结果
    const mockEnrichmentData = {
      analysisType,
      pValue,
      results: [
        {
          id: 'GO:0008150',
          term: 'biological_process',
          description: 'Any process specifically pertinent to the functioning of integrated living units',
          pValue: 0.001,
          adjustedPValue: 0.005,
          geneCount: Math.floor(genes.length * 0.8),
          totalGenes: genes.length,
          genes: genes.slice(0, Math.floor(genes.length * 0.8))
        },
        {
          id: 'GO:0005575',
          term: 'cellular_component',
          description: 'A location, relative to cellular compartments and structures',
          pValue: 0.003,
          adjustedPValue: 0.012,
          geneCount: Math.floor(genes.length * 0.6),
          totalGenes: genes.length,
          genes: genes.slice(0, Math.floor(genes.length * 0.6))
        },
        {
          id: 'GO:0003674',
          term: 'molecular_function',
          description: 'Elemental activities, such as catalysis or binding',
          pValue: 0.008,
          adjustedPValue: 0.025,
          geneCount: Math.floor(genes.length * 0.4),
          totalGenes: genes.length,
          genes: genes.slice(0, Math.floor(genes.length * 0.4))
        }
      ],
      significantCount: 3,
      totalCount: genes.length
    };

    // 记录分析日志
    try {
      await run(`
        INSERT INTO analysis_logs (analysis_type, input_data, parameters, result_summary, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [
        'enrichment_analysis',
        JSON.stringify({ genes: genes }),
        JSON.stringify({ analysisType, pValue }),
        JSON.stringify({ significantCount: mockEnrichmentData.significantCount, totalCount: mockEnrichmentData.totalCount })
      ]);
    } catch (logError) {
      console.error('记录分析日志失败:', logError);
    }

    res.json({
      success: true,
      data: mockEnrichmentData
    });

  } catch (error) {
    console.error('富集分析失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Enrichment analysis failed'
    });
  }
});

// 获取分析历史
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await get(
      'SELECT COUNT(*) as total FROM analysis_logs'
    );
    const total = countResult?.total || 0;

    // 获取分析历史
    const rows = await query(`
      SELECT 
        id, analysis_type, parameters, result_summary, created_at
      FROM analysis_logs 
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit, 10)} OFFSET ${offset}
    `);

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
    console.error('获取分析历史失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get analysis history'
    });
  }
});

// 获取分析工具信息
router.get('/tools', async (req, res) => {
  try {
    const tools = [
      {
        id: 'network',
        name: 'Protein-Protein Interaction Network',
        description: 'Analyze protein-protein interactions using STRING database',
        inputType: 'proteins',
        maxInputs: 100,
        parameters: [
          { name: 'species', type: 'select', default: 'homo sapiens' },
          { name: 'confidence', type: 'number', default: 0.4, min: 0, max: 1 }
        ]
      },
      {
        id: 'enrichment',
        name: 'Gene Enrichment Analysis',
        description: 'Perform GO, KEGG, and Reactome pathway enrichment analysis',
        inputType: 'genes',
        maxInputs: 500,
        parameters: [
          { name: 'analysisType', type: 'select', default: 'GO', options: ['GO', 'KEGG', 'Reactome'] },
          { name: 'pValue', type: 'number', default: 0.05, min: 0, max: 1 }
        ]
      }
    ];

    res.json({
      success: true,
      data: tools
    });

  } catch (error) {
    console.error('获取分析工具信息失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get analysis tool information'
    });
  }
});

module.exports = router;
