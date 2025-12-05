// src/store/modules/app.ts
import { defineStore } from 'pinia'
import { getStorage, setStorage } from '@/utils/storage'

// 定义 Sidebar 状态接口
interface SidebarState {
  opened: boolean
  withoutAnimation: boolean
}

// 定义 Device 类型
type DeviceType = 'desktop' | 'mobile' | 'tablet'

// 定义 TagsView 路由接口
interface TagView {
  path: string
  name: string
  title: string
  fullPath: string
  query?: Record<string, any>
  meta?: any
}

// 定义 App Store 状态接口
interface AppState {
  // 侧边栏状态
  sidebar: SidebarState

  // 设备类型
  device: DeviceType

  // 全局加载状态
  loading: boolean

  // 网络状态
  online: boolean

  // 缓存的路由组件名
  cachedViews: string[]

  // 已访问的路由（标签页）
  visitedViews: TagView[]

  // 错误日志
  errorLogs: any[]

  // 页面大小
  size: 'default' | 'small' | 'large'

  // 语言
  language: string

  // 主题
  theme: 'light' | 'dark'
}

// 创建应用 store
export const useAppStore = defineStore("app",{
  state: (): AppState => ({
    sidebar: {
      opened: getStorage('sidebarStatus') !== 'closed',
      withoutAnimation: false
    },

    device: 'desktop',

    loading: false,

    online: navigator.onLine,

    cachedViews: [],

    visitedViews: getStorage('visitedViews') || [],

    errorLogs: [],

    size: (getStorage('size') as any) || 'default',

    language: getStorage('language') || 'zh-cn',

    theme: (getStorage('theme') as any) || 'light'
  }),

  getters: {
    // 侧边栏是否打开
    isSidebarOpened: (state) => state.sidebar.opened,

    // 是否为移动设备
    isMobile: (state) => state.device === 'mobile',

    // 是否正在加载
    isLoading: (state) => state.loading,

    // 是否在线
    isOnline: (state) => state.online,

    // 获取缓存视图
    getCachedViews: (state) => state.cachedViews,

    // 获取访问过的视图
    getVisitedViews: (state) => state.visitedViews,

    // 获取错误日志
    getErrorLogs: (state) => state.errorLogs,

    // 获取页面尺寸
    getSize: (state) => state.size,

    // 获取语言
    getLanguage: (state) => state.language,

    // 获取主题
    getTheme: (state) => state.theme,

    // 获取侧边栏状态（计算属性）
    sidebarStatus: (state) => ({
      opened: state.sidebar.opened,
      hidden: !state.sidebar.opened
    })
  },

  actions: {
    /**
     * 切换侧边栏状态
     * @param withoutAnimation 是否无动画
     */
    toggleSidebar(withoutAnimation?: boolean) {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = withoutAnimation || false

      if (this.sidebar.opened) {
        setStorage('sidebarStatus', 'opened')
      } else {
        setStorage('sidebarStatus', 'closed')
      }
    },

    /**
     * 关闭侧边栏
     * @param withoutAnimation 是否无动画
     */
    closeSidebar(withoutAnimation?: boolean) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation || false
      setStorage('sidebarStatus', 'closed')
    },

    /**
     * 打开侧边栏
     * @param withoutAnimation 是否无动画
     */
    openSidebar(withoutAnimation?: boolean) {
      this.sidebar.opened = true
      this.sidebar.withoutAnimation = withoutAnimation || false
      setStorage('sidebarStatus', 'opened')
    },

    /**
     * 切换设备类型
     * @param device 设备类型
     */
    toggleDevice(device: DeviceType) {
      this.device = device
    },

    /**
     * 设置全局加载状态
     * @param loading 加载状态
     */
    setGlobalLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * 设置网络状态
     * @param online 是否在线
     */
    setNetworkStatus(online: boolean) {
      this.online = online
    },

    /**
     * 添加缓存视图
     * @param viewName 视图名称
     */
    addCachedView(viewName: string) {
      if (this.cachedViews.includes(viewName)) return
      this.cachedViews.push(viewName)
    },

    /**
     * 删除缓存视图
     * @param viewName 视图名称
     */
    deleteCachedView(viewName: string) {
      const index = this.cachedViews.indexOf(viewName)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    },

    /**
     * 清空缓存视图
     */
    clearCachedViews() {
      this.cachedViews = []
    },

    /**
     * 添加访问视图（标签页）
     * @param view 视图信息
     */
    addVisitedView(view: TagView) {
      // 检查是否已存在
      const index = this.visitedViews.findIndex(v => v.path === view.path)

      if (index > -1) {
        // 更新已存在的视图
        this.visitedViews.splice(index, 1, view)
      } else {
        // 添加新视图
        this.visitedViews.push(view)
      }

      // 保存到本地存储
      setStorage('visitedViews', this.visitedViews)
    },

    /**
     * 删除访问视图
     * @param view 视图信息
     */
    deleteVisitedView(view: TagView) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > -1) {
        this.visitedViews.splice(index, 1)
        setStorage('visitedViews', this.visitedViews)
      }
    },

    /**
     * 删除其他访问视图（保留当前）
     * @param view 当前视图
     */
    deleteOtherVisitedViews(view: TagView) {
      this.visitedViews = this.visitedViews.filter(v => {
        return v.path === view.path || v.meta?.affix
      })
      setStorage('visitedViews', this.visitedViews)
    },

    /**
     * 删除所有访问视图
     */
    deleteAllVisitedViews() {
      // 保留固定的标签页
      this.visitedViews = this.visitedViews.filter(tag => tag.meta?.affix)
      setStorage('visitedViews', this.visitedViews)
    },

    /**
     * 更新访问视图
     * @param oldView 旧视图
     * @param newView 新视图
     */
    updateVisitedView(oldView: TagView, newView: TagView) {
      const index = this.visitedViews.findIndex(v => v.path === oldView.path)
      if (index > -1) {
        this.visitedViews.splice(index, 1, newView)
        setStorage('visitedViews', this.visitedViews)
      }
    },

    /**
     * 添加错误日志
     * @param log 错误日志
     */
    addErrorLog(log: any) {
      this.errorLogs.push(log)
      // 最多保存50条错误日志
      if (this.errorLogs.length > 50) {
        this.errorLogs.splice(0, this.errorLogs.length - 50)
      }
    },

    /**
     * 清空错误日志
     */
    clearErrorLogs() {
      this.errorLogs = []
    },

    /**
     * 设置页面尺寸
     * @param size 尺寸大小
     */
    setSize(size: 'default' | 'small' | 'large') {
      this.size = size
      setStorage('size', size)
    },

    /**
     * 设置语言
     * @param language 语言
     */
    setLanguage(language: string) {
      this.language = language
      setStorage('language', language)
    },

    /**
     * 设置主题
     * @param theme 主题
     */
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      setStorage('theme', theme)

      // 更新文档根元素的类名
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },

    /**
     * 切换主题
     */
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      this.setTheme(this.theme)
    },

    /**
     * 重置应用状态（用于登出等场景）
     */
    resetState() {
      // 重置部分状态，但保留一些设置
      this.sidebar = {
        opened: getStorage('sidebarStatus') !== 'closed',
        withoutAnimation: false
      }
      this.device = 'desktop'
      this.loading = false
      this.cachedViews = []
      this.visitedViews = getStorage('visitedViews') || []
      this.errorLogs = []
      // 保留 size, language, theme 等用户设置
    },

    /**
     * 初始化应用设置
     */
    async initAppSettings() {
      try {
        // 初始化主题
        this.setTheme(this.theme)

        // 初始化语言
        const language = getStorage('language')
        if (language) {
          this.language = language
        }

        // 初始化页面尺寸
        const size = getStorage('size')
        if (size) {
          this.size = size as any
        }

        // 初始化侧边栏状态
        const sidebarStatus = getStorage('sidebarStatus')
        this.sidebar.opened = sidebarStatus !== 'closed'

        console.log('应用设置初始化完成')
      } catch (error) {
        console.error('应用设置初始化失败:', error)
      }
    }
  }
})

// 导出类型
export type { SidebarState, DeviceType, TagView, AppState }

// 默认导出
export default useAppStore