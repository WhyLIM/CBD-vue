import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const payload = response.data
    const hasSuccess = typeof payload === 'object' && payload !== null && Object.prototype.hasOwnProperty.call(payload, 'success')
    const success = hasSuccess ? !!payload.success : true
    if (!success) {
      const msg = payload.error || payload.message || '请求失败'
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
    let data
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) data = payload.data
    else if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'items')) data = payload.items
    else if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'results')) data = payload.results
    else if (Array.isArray(payload)) data = payload
    else data = payload
    const pSrc = (payload && payload.pagination) || (payload && payload.meta && payload.meta.pagination) || (payload && payload.meta) || null
    const currentPage = pSrc?.current ?? pSrc?.page ?? pSrc?.current_page ?? pSrc?.pageIndex ?? 1
    const pageSize = pSrc?.limit ?? pSrc?.pageSize ?? pSrc?.per_page ?? pSrc?.perPage ?? 20
    let totalItems = pSrc?.total ?? pSrc?.count ?? pSrc?.totalCount ?? pSrc?.records ?? 0
    if (!totalItems && Array.isArray(data)) totalItems = data.length
    const totalPages = pSrc?.pages ?? pSrc?.totalPages ?? pSrc?.last_page ?? (pageSize ? Math.ceil(totalItems / pageSize) : 0)
    return { success: true, data, pagination: { currentPage, pageSize, totalItems, totalPages } }
  },
  (error) => {
    let message = '网络错误'
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = data?.message || `连接错误${status}`
      }
    } else if (error.request) {
      message = '网络连接异常'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default api
