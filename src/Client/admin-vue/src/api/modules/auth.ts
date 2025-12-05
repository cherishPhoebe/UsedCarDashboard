import { request } from '@/api/request'
import type { LoginRequest, LoginResponse, User, Result } from '../types'

export const authApi = {
  // 登录
  login(data: LoginRequest): Promise<Result<LoginResponse>> {
    return request.post('/api/auth/login', data)
  },

  // 登出
  logout(): Promise<Result<void>> {
    return request.post('/api/auth/logout')
  },

  // 获取用户信息
  getUserInfo(): Promise<Result<User>> {
    return request.get('/api/user/info')
  },

  // 刷新token
  refreshToken(): Promise<Result<{ token: string }>> {
    return request.post('/api/auth/refresh')
  },

  // 修改密码
  changePassword(data: { oldPassword: string; newPassword: string }): Promise<Result<void>> {
    return request.post('/api/user/change-password', data)
  }
}