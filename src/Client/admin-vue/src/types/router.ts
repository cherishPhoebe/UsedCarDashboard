// src/types/router.ts
import type { RouteRecordRaw, RouteMeta, RouteLocationNormalized } from 'vue-router'

// 扩展路由meta信息
export interface RouteMetaExtended extends RouteMeta {
  // 页面标题
  title: string
  // 是否隐藏菜单
  hidden?: boolean
  // 是否固定标签页
  affix?: boolean
  // 是否缓存页面
  keepAlive?: boolean
  // 权限标识
  permission?: string
  // 图标
  icon?: string
  // 面包屑中是否显示
  breadcrumb?: boolean
  // 当路由有子路由时是否总是显示
  alwaysShow?: boolean
  // 激活的菜单
  activeMenu?: string
  // 是否不缓存
  noCache?: boolean
  // 排序
  sort?: number
  // 是否为外部链接
  externalLink?: boolean
  // 是否需要验证
  requiresAuth?: boolean
  // 是否为系统路由
  isSystem?: boolean
  // 路由切换动画
  transition?: string
  // 是否使用路径作为key
  usePathKey?: boolean
  // 标签页是否可关闭
  closable?: boolean
}

// 扩展路由记录
export interface RouteRecordExtended extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  meta?: RouteMetaExtended
  children?: RouteRecordExtended[]
}

// 标签页类型
export interface TagView {
  fullPath: string
  path: string
  name?: string
  meta: RouteMetaExtended
  title: string
  query?: Record<string, any>
  params?: Record<string, any>
}

// 菜单项类型
export interface MenuItem {
  id?: string
  path: string
  name?: string
  meta: RouteMetaExtended
  children?: MenuItem[]
  // 额外属性
  icon?: string
  title: string
  permission?: string
  sort?: number
  parentId?: string
  component?: string
  redirect?: string
  hidden?: boolean
  alwaysShow?: boolean
}

// 面包屑项类型
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
}

// 路由守卫上下文
export interface GuardContext {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  next: (to?: string | object | boolean) => void
}

// 路由配置
export interface RouterConfig {
  // 基础路径
  base: string
  // 路由模式
  mode: 'history' | 'hash'
  // 是否使用严格模式
  strict: boolean
  // 滚动行为
  scrollBehavior?: () => { x: number; y: number }
}

// 路由模块
export interface RouteModule {
  // 模块名称
  name: string
  // 路由配置
  routes: RouteRecordExtended[]
  // 排序
  order?: number
}

// 路由权限配置
export interface RoutePermission {
  // 路由名称或路径
  route: string
  // 需要的权限
  permissions: string[]
  // 需要的角色
  roles?: string[]
  // 是否严格匹配
  strict?: boolean
}

// 路由跳转选项
export interface NavigateOptions {
  // 是否替换当前路由
  replace?: boolean
  // 跳转前的回调
  beforeNavigate?: () => boolean | Promise<boolean>
  // 跳转后的回调
  afterNavigate?: () => void
  // 错误处理
  onError?: (error: Error) => void
}

// 路由查询参数类型
export type RouteQuery = Record<string, string | number | boolean | string[] | undefined>

// 路由参数类型
export type RouteParams = Record<string, string | number>

// 路由重定向配置
export interface RedirectConfig {
  // 源路径
  from: string
  // 目标路径
  to: string
  // 是否精确匹配
  exact?: boolean
  // 状态码
  statusCode?: number
}

// 路由懒加载配置
export interface LazyLoadConfig {
  // 加载组件
  component: () => Promise<any>
  // 加载中显示的组件
  loading?: any
  // 加载失败显示的组件
  error?: any
  // 延迟时间
  delay?: number
  // 超时时间
  timeout?: number
}

// 导出类型
export type {
  RouteMetaExtended as RouteMeta,
  RouteRecordExtended as RouteRecord
}