// src/types/global.d.ts

// Vue 相关扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    // 权限指令
    $hasPermission: (permission: string | string[]) => boolean
    $hasRole: (role: string | string[]) => boolean
    // 全局工具
    $format: any
    $validate: any
    $storage: any
  }
}

// 环境变量类型
interface ImportMetaEnv {
  // 基础URL
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string

  // 开发配置
  readonly VITE_DEV_PORT: string
  readonly VITE_DEV_HOST: string

  // 生产配置
  readonly VITE_PROD_URL: string
  readonly VITE_PROD_API_URL: string

  // 特性开关
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_SSR: string

  // 第三方服务
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ALGOLIA_APP_ID: string
  readonly VITE_ALGOLIA_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 全局 Window 对象扩展
interface Window {
  // 应用全局对象（用于调试）
  __RBAC_APP__: {
    appStore: any
    settingsStore: any
    authStore: any
    router: Router
  }

  // 阿里云OSS（如果使用）
  OSS: any

  // 其他第三方库
  [key: string]: any
}

// Element Plus 组件类型扩展
declare module 'element-plus' {
  interface ElMessageOptions {
    // 自定义选项
    customClass?: string
    showClose?: boolean
    duration?: number
    offset?: number
    grouping?: boolean
    // 扩展选项
    onClose?: () => void
    dangerouslyUseHTMLString?: boolean
  }

  interface ElNotificationOptions {
    // 自定义选项
    customClass?: string
    showClose?: boolean
    duration?: number
    offset?: number
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    // 扩展选项
    onClick?: () => void
    onClose?: () => void
  }

  interface ElLoadingOptions {
    // 自定义选项
    customClass?: string
    background?: string
    spinner?: string
    text?: string
    // 扩展选项
    target?: string | HTMLElement
    body?: boolean
    lock?: boolean
  }
}

// ECharts 类型
declare module 'echarts' {
  export interface EChartsOption {
    // 扩展配置
    [key: string]: any
  }

  export interface SeriesOption {
    // 扩展系列配置
    [key: string]: any
  }

  export interface ComponentOption {
    // 扩展组件配置
    [key: string]: any
  }
}

// 自定义指令类型
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// CSS 模块类型
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.sass' {
  const classes: { [key: string]: string }
  export default classes
}

// 图片资源类型
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src

  // SVG组件类型
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
}

declare module '*.ico' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

// 字体资源类型
declare module '*.woff' {
  const src: string
  export default src
}

declare module '*.woff2' {
  const src: string
  export default src
}

declare module '*.eot' {
  const src: string
  export default src
}

declare module '*.ttf' {
  const src: string
  export default src
}

declare module '*.otf' {
  const src: string
  export default src
}

// 其他资源类型
declare module '*.pdf' {
  const src: string
  export default src
}

declare module '*.csv' {
  const src: string
  export default src
}

declare module '*.xlsx' {
  const src: string
  export default src
}

declare module '*.md' {
  const src: string
  export default src
}

declare module '*.txt' {
  const src: string
  export default src
}

// 工具函数类型
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>
} : T

type Nullable<T> = T | null
type Optional<T> = T | undefined
type ValueOf<T> = T[keyof T]
type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>

// Promise 工具类型
type PromiseValue<T> = T extends Promise<infer V> ? V : T
type AsyncReturnType<T extends (...args: any) => any> = PromiseValue<ReturnType<T>>

// 数组工具类型
type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

// 对象工具类型
type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

// 函数工具类型
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

// 事件发射器类型
interface EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this
  once(event: string, listener: (...args: any[]) => void): this
  off(event: string, listener: (...args: any[]) => void): this
  emit(event: string, ...args: any[]): boolean
}

// 分页查询参数
interface PaginationQuery {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

// 响应数据包装
interface ResponseWrapper<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
  success: boolean
}

// 错误响应
interface ErrorResponse {
  code: number
  message: string
  errors?: Record<string, string[]>
  timestamp: number
}

// 表单验证错误
interface ValidationError {
  field: string
  message: string
}

// 文件上传
interface UploadProgressEvent {
  loaded: number
  total: number
  percent: number
}

interface UploadFile {
  uid: string
  name: string
  size: number
  type: string
  url: string
  status: 'uploading' | 'done' | 'error' | 'removed'
  percent?: number
  response?: any
  error?: any
}

// 树形数据
interface TreeNode<T = any> {
  id: string | number
  parentId?: string | number
  children?: TreeNode<T>[]
  [key: string]: any
}

// 下拉选项
interface SelectOption<T = any> {
  label: string
  value: T
  disabled?: boolean
  children?: SelectOption<T>[]
}

// 标签类型
interface TagType {
  label: string
  value: string | number
  color?: string
  icon?: string
}

// 路由元信息扩展
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    affix?: boolean
    keepAlive?: boolean
    permission?: string
    breadcrumb?: boolean
    activeMenu?: string
    noCache?: boolean
    alwaysShow?: boolean
    externalLink?: boolean
    requiresAuth?: boolean
    transition?: string
    usePathKey?: boolean
    closable?: boolean
  }
}

// 组件实例类型
interface ComponentInstance {
  $el: HTMLElement
  $props: Record<string, any>
  $emit: (event: string, ...args: any[]) => void
  $forceUpdate: () => void
  $nextTick: (callback?: () => void) => Promise<void>
}

// 全局工具函数声明
declare const $format: any
declare const $validate: any
declare const $storage: any
declare const $router: any
declare const $route: any
declare const $message: any
declare const $notification: any
declare const $loading: any
declare const $confirm: any
declare const $alert: any
declare const $prompt: any

// 全局 CSS 变量
interface CSSProperties {
  [key: `--${string}`]: string | number
}

// 声明全局变量（用于非模块化脚本）
declare var __DEV__: boolean
declare var __PROD__: boolean
declare var __TEST__: boolean
declare var __VERSION__: string

// 扩展全局对象
declare global {
  // 工具类型
  type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>
  } : T

  type Nullable<T> = T | null
  type Optional<T> = T | undefined

  // 全局函数
  function log(message: string, ...args: any[]): void
  function warn(message: string, ...args: any[]): void
  function error(message: string, ...args: any[]): void

  // 全局对象
  interface Global {
    // 应用实例
    app: any
    // 路由实例
    router: any
    // 存储实例
    store: any
  }

  var global: Global
}

// 确保这是一个模块
export { }