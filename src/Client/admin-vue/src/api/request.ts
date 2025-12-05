import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'
import router from '@/router'
import type { Result } from '@/api/types'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useAuthStore()
    const token = userStore.token

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加请求时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    const { code, message } = data

    // 业务成功
    if (code === 200) {
      return data
    }

    // 业务错误处理
    switch (code) {
      case 401:
        // 未授权，跳转到登录页
        ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userStore = useAuthStore()
          userStore.logout()
          router.push('/login')
        })
        break
      case 403:
        // 权限不足
        ElMessage.error('权限不足，无法访问')
        router.push('/401')
        break
      default:
        ElMessage.error(message || '请求失败')
    }

    return Promise.reject(new Error(message || 'Error'))
  },
  (error) => {
    // HTTP错误处理
    if (error.response) {
      switch (error.response.status) {
        case 400:
          ElMessage.error('请求错误')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 502:
          ElMessage.error('网关错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        default:
          ElMessage.error(error.message)
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

// 导出封装的请求方法
export const request = {
  get<T = any>(url: string, params?: object): Promise<Result<T>> {
    return service.get(url, { params })
  },

  post<T = any>(url: string, data?: object): Promise<Result<T>> {
    return service.post(url, data)
  },

  put<T = any>(url: string, data?: object): Promise<Result<T>> {
    return service.put(url, data)
  },

  delete<T = any>(url: string, params?: object): Promise<Result<T>> {
    return service.delete(url, { params })
  },

  upload<T = any>(url: string, file: File, data?: object): Promise<Result<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
    }

    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default service