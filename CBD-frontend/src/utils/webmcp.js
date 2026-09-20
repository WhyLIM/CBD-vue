import api from '@/utils/api'

// WebMCP（W3C Web Machine Learning CG 提案）工具注册
// 规范：https://github.com/webmachinelearning/webmcp
// 支持该提案的 AI Agent（浏览器内置代理 / 扩展）可以把本站当作一组结构化工具
// 直接调用（而非解析 HTML）。浏览器不支持时静默跳过，站点功能不受影响。

function textResult(text, isError = false) {
  const result = { content: [{ type: 'text', text }] }
  if (isError) result.isError = true
  return result
}

function jsonResult(data) {
  return textResult(JSON.stringify(data, null, 2))
}

const intParam = (v, fallback) => (Number.isInteger(v) ? v : fallback)

const tools = [
  {
    name: 'get-database-stats',
    description:
      'Get CBD3 (Colorectal Cancer Biomarker Database) statistics: total biomarker records, per-category counts and data coverage.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const res = await api.get('/stats')
      return jsonResult(res)
    }
  },
  {
    name: 'search-biomarkers',
    description:
      'Search colorectal cancer biomarker records. Returns paginated records with name, category (Protein/MicroRNA/...), application, sample source, region, stage, journal and PMID.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Keyword matched against biomarker name/description' },
        category: { type: 'string', description: 'Biomarker category, e.g. Protein, MicroRNA' },
        source: { type: 'string', description: 'Sample source, e.g. Tissue, Blood, Serum' },
        region: { type: 'string', description: 'Study region, e.g. Asia, Europe' },
        stage: { type: 'string', description: 'Cancer stage, e.g. Stage II-III' },
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 10, maximum: 100 }
      }
    },
    async execute(params = {}) {
      const res = await api.get('/biomarkers', { params })
      const rows = res.data || []
      const summary = `Found ${res.pagination?.totalItems ?? rows.length} records; showing page ${res.pagination?.currentPage ?? 1} of ${res.pagination?.totalPages ?? 1}. Use get-biomarker-detail with a record id for the full entry.`
      return textResult(summary + '\n\n' + JSON.stringify(rows, null, 2))
    }
  },
  {
    name: 'get-biomarker-detail',
    description:
      'Get the full CBD3 record of a single biomarker by its numeric id (find ids with search-biomarkers first): description, experiments, clinical relevance, literature reference.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Biomarker record id' }
      },
      required: ['id']
    },
    async execute({ id }) {
      const res = await api.get(`/biomarkers/${id}`)
      return jsonResult(res)
    }
  },
  {
    name: 'quick-search',
    description: 'Quick keyword search across the whole CBD3 database.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search keyword' },
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 10 }
      },
      required: ['q']
    },
    async execute({ q, page, limit } = {}) {
      const res = await api.get('/search/quick', { params: { q, page, limit } })
      return jsonResult(res)
    }
  },
  {
    name: 'list-filter-options',
    description:
      'List all filter options usable in other tools: cell types, sub clusters, samples, patients, datasets for the single-cell data.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const analysis = await api.get('/analysis/metadata/filters')
      return jsonResult(analysis)
    }
  },
  {
    name: 'search-genes',
    description: 'Autocomplete search for gene symbols available in the single-cell dataset (prefix match).',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Gene symbol prefix, e.g. TP5' },
        limit: { type: 'integer', default: 20, maximum: 50 }
      },
      required: ['q']
    },
    async execute({ q, limit } = {}) {
      const res = await api.get('/scrna/gene-search', { params: { q, limit } })
      return jsonResult(res)
    }
  },
  {
    name: 'get-gene-expression',
    description:
      'Per-cell expression of one or more genes from the single-cell UMAP dataset (multiple genes return the per-cell mean). Returns aggregate statistics (mean, max, fraction of expressing cells) plus a capped list of cells.',
    inputSchema: {
      type: 'object',
      properties: {
        genes: {
          type: 'array',
          items: { type: 'string' },
          description: 'One or more gene symbols, e.g. ["TP53","KRAS"]',
          maxItems: 50
        },
        limit: { type: 'integer', default: 2000, maximum: 5000, description: 'Max number of cells returned in the cell list' }
      },
      required: ['genes']
    },
    async execute({ genes, limit } = {}) {
      const list = (genes || []).map(g => String(g).trim()).filter(Boolean)
      if (!list.length) return textResult('Error: provide at least one gene symbol.', true)
      const capped = Math.min(intParam(limit, 2000), 5000)
      const res = await api.get('/scrna/gene-expr', { params: { gene: list.join(','), limit: capped } })
      const rows = res.data || []
      if (!rows.length) return textResult(`No expression data found for: ${list.join(', ')}`, true)
      const exprs = rows.map(r => Number(r.expr) || 0)
      const stats = {
        genes: list,
        cells: rows.length,
        mean: +(exprs.reduce((s, v) => s + v, 0) / rows.length).toFixed(6),
        max: +Math.max(...exprs).toFixed(6),
        fraction_expressing: +(exprs.filter(v => v > 0).length / rows.length).toFixed(4)
      }
      return textResult(
        'Aggregate statistics:\n' +
        JSON.stringify(stats, null, 2) +
        '\n\nFirst cells (cell, mean expression):\n' +
        JSON.stringify(rows.slice(0, 20).map(r => ({ cell: r.cell, expr: r.expr })), null, 2)
      )
    }
  },
  {
    name: 'get-deg-analysis',
    description:
      'Differential expression analysis between tumor and normal / across cell types. Returns per-gene log2FC, adjusted p-value and -log10(padj).',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['original', 'celltype', 'tvsn'],
          description: 'original: within-cohort DEGs; celltype: by cell type; tvsn: tumor vs normal'
        },
        celltype: { type: 'string', description: 'Cell type name (see list-filter-options)' },
        gene: { type: 'string', description: 'Gene symbol, or comma separated multiple genes' },
        min_logfc: { type: 'number', description: 'Minimum |log2FC|' },
        max_padj: { type: 'number', description: 'Maximum adjusted p-value' },
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 20, maximum: 100 }
      }
    },
    async execute(params = {}) {
      const mode = ['original', 'celltype', 'tvsn'].includes(params.mode) ? params.mode : 'celltype'
      const query = { page: params.page, limit: params.limit }
      if (params.gene) query.gene = params.gene
      if (mode === 'original') {
        if (params.celltype) query.cell_type = params.celltype
        if (params.min_logfc != null) query.min_logfc = params.min_logfc
        const res = await api.get('/analysis/degs', { params: query })
        return jsonResult(res)
      }
      if (params.celltype) query.celltype = params.celltype
      if (params.min_logfc != null) query.min_logfc = params.min_logfc
      if (params.max_padj != null) query.max_padj = params.max_padj
      const path = mode === 'celltype' ? '/analysis/gene-diff/celltype' : '/analysis/gene-diff/tvsn'
      const res = await api.get(path, { params: query })
      return jsonResult(res)
    }
  },
  {
    name: 'get-cellchat-interactions',
    description:
      'Query cell-cell communication (CellChat) interactions, including pathway annotation and evidence (KEGG/PMID). Filter by sending/receiving cell type, pathway, or ligand/receptor gene (fuzzy, works inside complexes).',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Sending cell type, e.g. Fib, Mono/Macro' },
        target: { type: 'string', description: 'Receiving cell type' },
        pathway_name: { type: 'string', description: 'Pathway name, e.g. TGFb, BMP' },
        gene: { type: 'string', description: 'Ligand/receptor gene (fuzzy match inside complexes)' },
        annotation: { type: 'string', description: 'Signal category: Secreted Signaling, Cell-Cell Contact, ECM-Receptor' },
        min_prob: { type: 'number', description: 'Minimum communication probability' },
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 20, maximum: 100 }
      }
    },
    async execute(params = {}) {
      const query = { page: params.page, limit: params.limit }
      for (const k of ['source', 'target', 'pathway_name', 'annotation', 'gene', 'min_prob']) {
        if (params[k] != null && params[k] !== '') query[k] = params[k]
      }
      const res = await api.get('/analysis/cellchat-raw', { params: query })
      return jsonResult(res)
    }
  },
  {
    name: 'get-roc-predictive-ability',
    description:
      'Predictive ability (ROC) of genes: Tumor vs Normal or cell-type prediction. Returns AUC, p-value, direction and quality label (Poor/Fair/Good/Excellent).',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['tn', 'celltype'], description: 'tn: Tumor vs Normal; celltype: cell-type prediction' },
        celltype: { type: 'string', description: 'Cell type filter' },
        gene: { type: 'string', description: 'Gene symbol, or comma separated multiple genes' },
        min_auc: { type: 'number', description: 'Minimum AUC (0.5-1)' },
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 20, maximum: 100 }
      }
    },
    async execute(params = {}) {
      const mode = params.mode === 'celltype' ? 'celltype' : 'tn'
      const query = { page: params.page, limit: params.limit }
      if (params.celltype) query.celltype = params.celltype
      if (params.gene) query.gene = params.gene
      if (params.min_auc != null) query.min_auc = params.min_auc
      const res = await api.get(`/analysis/roc/${mode}`, { params: query })
      return jsonResult(res)
    }
  },
  {
    name: 'get-clinical-evidence',
    description:
      'Clinical evidence of a gene: diagnosis AUC, survival analysis (by cancer stage/type), or immune infiltration correlation.',
    inputSchema: {
      type: 'object',
      properties: {
        evidence: {
          type: 'string',
          enum: ['diagnosis', 'survival', 'immune'],
          description: 'Which clinical dataset to query'
        },
        gene: { type: 'string', description: 'Gene symbol' },
        label: { type: 'string', description: '(diagnosis) diagnosis label filter' },
        surv_type: { type: 'string', description: '(survival) survival type filter' },
        immune_cell: { type: 'string', description: '(immune) immune cell type filter' },
        page: { type: 'integer', default: 1 },
        limit: { type: 'integer', default: 20, maximum: 100 }
      },
      required: ['evidence', 'gene']
    },
    async execute({ evidence, gene, label, surv_type, immune_cell, page, limit } = {}) {
      const routes = { diagnosis: '/clinical/diagnosis', survival: '/clinical/survival', immune: '/clinical/immune' }
      const path = routes[evidence]
      if (!path) return textResult(`Error: unknown evidence type "${evidence}".`, true)
      const params = { gene, page, limit }
      if (label) params.label = label
      if (surv_type) params.surv_type = surv_type
      if (immune_cell) params.immune_cell = immune_cell
      const res = await api.get(path, { params })
      return jsonResult(res)
    }
  }
]

/**
 * 注册全部工具。浏览器不支持 WebMCP（绝大多数当前环境）时静默跳过；
 * 页面被 Permissions-Policy 禁用（tools=()）时 registerTool 会抛
 * NotAllowedError，同样被捕获并跳过。
 */
export async function registerWebMcpTools() {
  if (typeof document === 'undefined' || !('modelContext' in document)) return false
  for (const tool of tools) {
    try {
      await document.modelContext.registerTool({
        ...tool,
        execute: async (args) => {
          try {
            return await tool.execute(args || {})
          } catch (err) {
            console.warn(`[WebMCP] tool ${tool.name} failed:`, err?.message)
            return textResult(
              `Error: ${err?.message || 'request failed'}. The site or upstream may be temporarily unavailable.`,
              true
            )
          }
        }
      })
    } catch (err) {
      console.warn(`[WebMCP] register ${tool.name} skipped:`, err?.name || err?.message)
    }
  }
  return true
}
