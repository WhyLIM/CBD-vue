import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { success, data, error } = response.data
    
    // 根据业务状态码处理
    if (success) {
      return response.data
    } else {
      ElMessage.error(error || '请求失败')
      return Promise.reject(new Error(error || '请求失败'))
    }
  },
  (error) => {
    let message = '网络错误'
    
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          message = data.message || '请求参数错误'
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
          message = data.message || `连接错误${status}`
      }
    } else if (error.request) {
      message = '网络连接异常'
    }
    
    ElMessage.error(message)
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

export default api