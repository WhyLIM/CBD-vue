import { defineStore } from 'pinia'
import api from '@/utils/api'
import axios from 'axios'

export const useBiomarkerStore = defineStore('biomarker', {
  state: () => ({
    biomarkers: [],
    currentBiomarker: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
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
          b.String_Name?.toLowerCase().includes(searchTerm) ||
          b.Discription?.toLowerCase().includes(searchTerm) ||
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
        const response = await api.get('/biomarkers', { params })
        // console.log('API 响应数据:', response.data); // 调试日志
        this.biomarkers = response.data || []; // 当前页数据
        // 更新分页信息
        this.pagination = {
          page: response.pagination?.current || 1,
          limit: response.pagination?.limit || 20,
          total: response.pagination?.count || 0,
          pages: response.pagination?.total || 0
        };
        return response.data
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
        const response = await api.get(`/biomarkers/${id}`)
        this.currentBiomarker = response.data.data
        return response.data
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
      try {
        console.log('Sending advanced search request, params:', params)
        // 使用配置好的api实例
        const response = await api.post('/search/advanced', params)
        console.log('Advanced search response:', response)

        // 返回标准格式的响应
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          }
        }
      } catch (error) {
        console.error('Advanced search failed:', error)
        console.error('Error details:', error.response?.data || error.message)
        throw error
      }
    },

    // 快速搜索
    async quickSearch(query, page = 1, limit = 10) {
      try {
        const response = await api.get('/search/quick', {
          params: { q: query, page, limit }
        })
        return response.data
      } catch (error) {
        console.error('快速搜索失败:', error)
        throw error
      }
    },

    // 获取搜索建议
    async getSearchSuggestions(query, type = 'biomarker') {
      try {
        const response = await api.get('/search/suggestions', {
          params: { q: query, type }
        })
        return response.data
      } catch (error) {
        console.error('获取搜索建议失败:', error)
        throw error
      }
    },

    // 获取筛选选项
    async getFilterOptions() {
      try {
        const response = await api.get('/search/filters')
        console.log('API response:', response.data)
        return {
          success: true,
          data: response.data
        }
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