import api from '@/utils/api'

export default {
  getUmap(params) {
    return api.get('/scrna/umap', { params })
  },
  getFilters() {
    return api.get('/scrna/metadata/filters')
  },
  getCell(id) {
    return api.get(`/scrna/cell/${encodeURIComponent(id)}`)
  },
  exportData(params) {
    return api.get('/scrna/export', { params })
  },
  // CBD3 新增
  getGeneExpr(params) {
    return api.get('/scrna/gene-expr', { params })
  },
  searchGenes(params) {
    return api.get('/scrna/gene-search', { params })
  }
}
