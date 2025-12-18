import api from '@/utils/api'

export default {
  getDegs(params) { return api.get('/analysis/degs', { params }) },
  getKegg(params) { return api.get('/analysis/kegg', { params }) },
  getRidge(params) { return api.get('/analysis/ridge', { params }) },
  getTrajectoryFiles(params) { return api.get('/analysis/trajectory/files', { params }) },
  getCellChat(params) { return api.get('/analysis/cellchat', { params }) },
  getCellChatNetwork(params) { return api.get('/analysis/cellchat/network', { params }) },
  getFilters() { return api.get('/analysis/metadata/filters') }
}
