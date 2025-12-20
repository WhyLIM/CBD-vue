import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useBiomarkerStore = defineStore('biomarker', {
  state: () => ({
    biomarkers: [],
    currentBiomarker: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0
    },
    filters: {
      category: '',
      source: '',
      search: ''
    }
  }),

  getters: {
    getBiomarkerById: (state) => (id) => {
      return state.biomarkers.find(biomarker => biomarker.ID === parseInt(id))
    },

    filteredBiomarkers: (state) => {
      let filtered = state.biomarkers

      if (state.filters.category) {
        filtered = filtered.filter(b => b.Category === state.filters.category)
      }

      if (state.filters.source) {
        filtered = filtered.filter(b => b.Source === state.filters.source)
      }

      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase()
        filtered = filtered.filter(b =>
          b.Biomarker?.toLowerCase().includes(searchTerm) ||
          b.Symbol?.toLowerCase().includes(searchTerm) ||
          b.Description?.toLowerCase().includes(searchTerm) ||
          b.Application?.toLowerCase().includes(searchTerm)
        )
      }

      return filtered
    }
  },

  actions: {
    // 获取所有生物标志物
    async fetchBiomarkers(params = {}) {
      this.loading = true
      this.error = null

      try {
        const resp = await api.get('/biomarkers', { params })
        this.biomarkers = resp.data || []
        this.pagination = {
          currentPage: resp.pagination?.currentPage ?? this.pagination.currentPage,
          pageSize: resp.pagination?.pageSize ?? this.pagination.pageSize,
          totalItems: resp.pagination?.totalItems ?? 0,
          totalPages: resp.pagination?.totalPages ?? 0
        }
        return resp.data
      } catch (error) {
        this.error = error.message
        console.error('获取生物标志物失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 根据ID获取单个生物标志物
    async fetchBiomarkerById(id) {
      this.loading = true
      this.error = null

      try {
        const resp = await api.get(`/biomarkers/${id}`)
        this.currentBiomarker = resp.data
        return resp.data
      } catch (error) {
        this.error = error.message
        console.error('获取生物标志物详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 高级搜索
    async advancedSearch(params) {
      return api.post('/search/advanced', params)
    },

    // 快速搜索
    async quickSearch(query, page = 1, limit = 10) {
      try {
        const resp = await api.get('/search/quick', {
          params: { q: query, page, limit }
        })
        return resp.data
      } catch (error) {
        console.error('快速搜索失败:', error)
        throw error
      }
    },

    // 获取搜索建议
    async getSearchSuggestions(query, type = 'biomarker') {
      try {
        const resp = await api.get('/search/suggestions', {
          params: { q: query, type }
        })
        return resp.data
      } catch (error) {
        console.error('获取搜索建议失败:', error)
        throw error
      }
    },

    // 获取筛选选项
    async getFilterOptions() {
      try {
        const resp = await api.get('/search/filters')
        return resp
      } catch (error) {
        console.error('获取筛选选项失败:', error)
        throw error
      }
    },

    // 设置筛选条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    // 清除筛选条件
    clearFilters() {
      this.filters = {
        category: '',
        source: '',
        search: ''
      }
    },

    // 设置分页
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    }
  }
})
