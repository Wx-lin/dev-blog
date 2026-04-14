import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// ── 请求拦截器：自动携带 Token ──
request.interceptors.request.use((config) => {
  const raw = localStorage.getItem('blog-auth')
  if (raw) {
    try {
      const state = JSON.parse(raw)
      const token = state?.state?.token
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch {
      // ignore
    }
  }
  return config
})

// ── 响应拦截器：统一解包 / 处理 401 ──
request.interceptors.response.use(
  (res) => {
    const { code, message, data } = res.data
    if (code === 0) return data
    if (code === 401) {
      // Token 失效，清除本地登录态
      localStorage.removeItem('blog-auth')
      window.location.href = '/login'
      return Promise.reject(new Error('未登录或登录已过期，请重新登录'))
    }
    return Promise.reject(new Error(message || '请求失败'))
  },
  (err) => Promise.reject(err)
)

export default request
