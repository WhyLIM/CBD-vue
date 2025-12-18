import { defineStore } from 'pinia'
import analysisApi from '@/services/analysis'
import clinicalApi from '@/services/clinical'

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    filters: { cell_type: '', gene: '' },
    degs: { items: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
    kegg: { items: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
    ridge: { items: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
    traj: { items: [], pagination: { currentPage: 1, pageSize: 12, totalItems: 0, totalPages: 0 } },
    cellchat: { items: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
    diagnosis: { items: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
    survival: { items: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
    immune: { items: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } }
  }),
  actions: {
    setFilters(f) { this.filters = { ...this.filters, ...f } },
    async fetchDegs(params) { const resp = await analysisApi.getDegs({ ...this.filters, ...params }); this.degs.items = resp.data || []; this.degs.pagination = resp.pagination },
    async fetchKegg(params) { const resp = await analysisApi.getKegg({ ...this.filters, ...params }); this.kegg.items = resp.data || []; this.kegg.pagination = resp.pagination },
    async fetchRidge(params) { const resp = await analysisApi.getRidge({ ...this.filters, ...params }); this.ridge.items = resp.data || []; this.ridge.pagination = resp.pagination },
    async fetchTrajectory(params) { const resp = await analysisApi.getTrajectoryFiles({ ...this.filters, ...params }); this.traj.items = resp.data || []; this.traj.pagination = resp.pagination },
    async fetchCellChat(params) { const resp = await analysisApi.getCellChat({ ...params }); this.cellchat.items = resp.data || []; this.cellchat.pagination = resp.pagination },
    async fetchDiagnosis(params) { const resp = await clinicalApi.getDiagnosis({ ...params }); this.diagnosis.items = resp.data || []; this.diagnosis.pagination = resp.pagination },
    async fetchSurvival(params) { const resp = await clinicalApi.getSurvival({ ...params }); this.survival.items = resp.data || []; this.survival.pagination = resp.pagination },
    async fetchImmune(params) { const resp = await clinicalApi.getImmune({ ...params }); this.immune.items = resp.data || []; this.immune.pagination = resp.pagination }
  }
})
