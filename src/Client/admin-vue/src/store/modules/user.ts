// store/modules/user.ts
import { defineStore } from 'pinia'
import { authApi } from '@/api/modules/auth'
import type { Permission } from '@/api/types'

export interface IUserState {
  token: string
  userInfo: any
  permissions: Permission[] | undefined
}

export const useUserStore = defineStore('user', {
  state: (): IUserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: {},
    permissions: []
  }),
  actions: {
    async login(loginForm: { username: string; password: string }) {
      const res = await authApi.login(loginForm)
      this.token = res.data.token
      localStorage.setItem('token', this.token)
      // 获取用户信息
      await this.getUserInfo()
    },
    async logout() {
      await authApi.logout()
      this.token = ''
      this.userInfo = {}
      this.permissions = []
      localStorage.removeItem('token')
    },
    async getUserInfo() {
      const res = await authApi.getUserInfo()
      this.userInfo = res.data
      this.permissions = res.data.permissions
    },
    hasPermission(permission: Permission) {
      return this.permissions?.includes(permission)
    }
  }
})