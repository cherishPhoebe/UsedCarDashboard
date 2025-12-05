import { defineStore } from 'pinia'
import { authApi } from '@/api/modules/auth'
import { userApi } from '@/api/modules/user'
import type { User, Permission } from '@/api/types'
import { storage } from '@/utils/storage'
import router from '@/router'

interface AuthState {
  token: string
  userInfo: User | null
  permissions: string[]
  permissionTree: Permission[]
  routes: any[] // 动态路由
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: storage.get('token') || '',
    userInfo: null,
    permissions: [],
    permissionTree: [],
    routes: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasUserInfo: (state) => !!state.userInfo,

    // 权限检查
    hasPermission: (state) => {
      return (permission: string) => {
        if (!permission) return true
        return state.permissions.includes(permission)
      }
    },

    // 菜单权限过滤
    menuPermissions: (state) => {
      const filterMenu = (permissions: Permission[]): Permission[] => {
        return permissions
          .filter(p => p.type === 1 && state.permissions.includes(p.code))
          .map(p => ({
            ...p,
            children: p.children ? filterMenu(p.children) : []
          }))
          .filter(p => p.children?.length || p.path)
      }
      return filterMenu(state.permissionTree)
    }
  },

  actions: {
    // 登录
    async login(loginForm: { username: string; password: string; rememberMe?: boolean }) {
      try {
        const { data } = await authApi.login(loginForm)

        this.token = data.token
        this.userInfo = data.user
        this.permissions = data.permissions

        // 存储token
        const storageConfig = {
          expire: (loginForm.rememberMe ? 7 : 1) * 24 * 60 * 60
        }
        storage.set('token', data.token, storageConfig)

        // 获取权限树
        await this.getPermissionTree()

        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取权限树
    async getPermissionTree() {
      try {
        const { data } = await userApi.getPermissionTree()
        this.permissionTree = data
      } catch (error) {
        console.error('获取权限树失败:', error)
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const { data } = await authApi.getUserInfo()
        this.userInfo = data
        return data
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 登出
    async logout() {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.reset()
        storage.remove('token')
        router.push('/login')
      }
    },

    // 重置状态
    reset() {
      this.$reset()
    }
  },
})