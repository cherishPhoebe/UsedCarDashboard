// src/types/store.ts
import type { User, Permission, Role, LoginResponse } from './api'
import type { TagView, MenuItem } from './router'

// 应用状态
export interface AppState {
  // 侧边栏状态
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }

  // 设备类型
  device: 'desktop' | 'mobile' | 'tablet'

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

// 认证状态
export interface AuthState {
  // 访问令牌
  token: string

  // 刷新令牌
  refreshToken?: string

  // 用户信息
  userInfo: User | null

  // 权限列表
  permissions: string[]

  // 角色列表
  roles: string[]

  // 权限树
  permissionTree: Permission[]

  // 动态路由
  routes: any[]

  // 菜单列表
  menus: MenuItem[]

  // 登录状态
  isLoggedIn: boolean

  // 最后活动时间
  lastActiveTime: number

  // 会话过期时间
  sessionExpireTime?: number
}

// 用户状态
export interface UserState {
  // 用户列表
  userList: User[]

  // 当前选中用户
  currentUser: User | null

  // 分页信息
  pagination: {
    page: number
    pageSize: number
    total: number
  }

  // 查询条件
  queryParams: Record<string, any>

  // 加载状态
  loading: boolean

  // 选中行
  selectedRows: User[]
}

// 角色状态
export interface RoleState {
  // 角色列表
  roleList: Role[]

  // 当前选中角色
  currentRole: Role | null

  // 分页信息
  pagination: {
    page: number
    pageSize: number
    total: number
  }

  // 查询条件
  queryParams: Record<string, any>

  // 加载状态
  loading: boolean

  // 选中行
  selectedRows: Role[]
}

// 权限状态
export interface PermissionState {
  // 权限列表
  permissionList: Permission[]

  // 权限树
  permissionTree: Permission[]

  // 当前选中权限
  currentPermission: Permission | null

  // 分页信息
  pagination: {
    page: number
    pageSize: number
    total: number
  }

  // 查询条件
  queryParams: Record<string, any>

  // 加载状态
  loading: boolean

  // 选中行
  selectedRows: Permission[]
}

// 系统设置状态
export interface SettingsState {
  // 主题设置
  theme: {
    // 主题模式
    mode: 'light' | 'dark' | 'auto'
    // 主题颜色
    color: string
    // 是否跟随系统
    followSystem: boolean
  }

  // 布局设置
  layout: {
    // 是否固定头部
    fixedHeader: boolean
    // 是否显示标签页
    showTagsView: boolean
    // 是否显示侧边栏logo
    showSidebarLogo: boolean
    // 是否显示面包屑
    showBreadcrumb: boolean
    // 是否显示页脚
    showFooter: boolean
    // 是否显示水印
    showWatermark: boolean
    // 侧边栏主题
    sidebarTheme: 'dark' | 'light'
    // 标签页风格
    tagsViewStyle: 'card' | 'border-card'
  }

  // 导航设置
  navigation: {
    // 是否启用动画
    enableAnimation: boolean
    // 动画类型
    animationType: string
    // 是否启用进度条
    enableProgressBar: boolean
    // 是否启用错误处理
    enableErrorHandler: boolean
  }

  // 界面设置
  interface: {
    // 语言
    language: string
    // 页面尺寸
    size: 'default' | 'small' | 'large'
    // 是否紧凑
    compact: boolean
    // 是否显示侧边栏文字
    showSidebarText: boolean
  }

  // 其他设置
  other: {
    // 是否开启灰度模式
    enableGrayMode: boolean
    // 是否开启色弱模式
    enableColorWeakness: boolean
    // 是否开启多标签页
    enableMultiTabs: boolean
    // 是否开启页面缓存
    enablePageCache: boolean
    // 是否开启请求重试
    enableRequestRetry: boolean
  }
}

// 标签页状态
export interface TagsViewState {
  // 已访问的视图
  visitedViews: TagView[]

  // 缓存的视图
  cachedViews: string[]

  // 当前激活的视图
  activeView: TagView | null

  // 上次激活的视图
  lastActiveView: TagView | null
}

// 标签页操作
export interface TagsViewAction {
  // 添加视图
  addView: (view: TagView) => void
  // 删除视图
  deleteView: (view: TagView) => void
  // 删除其他视图
  deleteOtherViews: (view: TagView) => void
  // 删除所有视图
  deleteAllViews: () => void
  // 更新视图
  updateView: (view: TagView) => void
}

// 全局状态
export interface GlobalState {
  // 是否显示设置面板
  showSettings: boolean

  // 是否显示全屏
  fullscreen: boolean

  // 是否显示消息中心
  showMessageCenter: boolean

  // 未读消息数量
  unreadMessageCount: number

  // 是否显示通知
  showNotifications: boolean

  // 未读通知数量
  unreadNotificationCount: number

  // 系统公告
  announcements: any[]
}

// Store 模块
export interface StoreModules {
  app: AppState
  auth: AuthState
  user: UserState
  role: RoleState
  permission: PermissionState
  settings: SettingsState
  tagsView: TagsViewState
  global: GlobalState
}

// Store 根状态
export interface RootState {
  app: AppState
  auth: AuthState
  user: UserState
  role: RoleState
  permission: PermissionState
  settings: SettingsState
  tagsView: TagsViewState
  global: GlobalState
}

// Store 动作上下文
export interface ActionContext<S, R> {
  state: S
  rootState: R
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => Promise<any>
  getters: any
  rootGetters: any
}

// Store 选项
export interface StoreOptions<S> {
  // 状态
  state: () => S
  // 获取器
  getters?: Record<string, (state: S, getters: any, rootState: RootState, rootGetters: any) => any>
  // 动作
  actions?: Record<string, (context: ActionContext<S, RootState>, payload?: any) => any>
  // 是否持久化
  persist?: boolean
  // 持久化配置
  persistConfig?: {
    key?: string
    storage?: Storage
    paths?: string[]
    beforeRestore?: (context: any) => void
    afterRestore?: (context: any) => void
  }
}

// Pinia Store 定义
export interface PiniaStoreDefinition {
  id: string
  state: () => any
  getters?: Record<string, any>
  actions?: Record<string, any>
}

