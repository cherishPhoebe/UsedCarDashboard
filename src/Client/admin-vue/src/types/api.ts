// src/types/api.ts

// 基础响应结构
export interface Result<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页参数
export interface PageParams {
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'ascend' | 'descend' | 'asc' | 'desc'
  [key: string]: any // 允许其他查询参数
}

// 分页结果
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户相关类型
export interface User {
  id: string
  username: string
  nickname?: string
  email: string
  phone?: string
  avatar?: string
  gender?: number
  status: number
  isSuperAdmin: boolean
  lastLoginAt?: string
  lastLoginIp?: string
  createdAt: string
  updatedAt?: string
  roles?: Role[]
  permissions?: Permission[]
}

export interface CreateUserRequest {
  username: string
  password: string
  email: string
  phone?: string
  nickname?: string
  gender?: number
  roleIds?: string[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  phone?: string
  nickname?: string
  gender?: number
  status?: number
  avatar?: string
  roleIds?: string[]
}

export interface UserQueryParams extends PageParams {
  username?: string
  email?: string
  phone?: string
  status?: number
  roleId?: string
  startTime?: string
  endTime?: string
}

// 角色相关类型
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  isSystem: boolean
  sort: number
  createdAt: string
  updatedAt?: string
  permissions?: Permission[]
  userCount?: number
}

export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  sort?: number
  permissionIds?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  code?: string
  description?: string
  sort?: number
  permissionIds?: string[]
}

export interface RoleQueryParams extends PageParams {
  name?: string
  code?: string
  isSystem?: boolean
}

// 权限相关类型
export interface Permission {
  id: string
  name: string
  code: string
  type: PermissionType
  parentId?: string
  path?: string
  component?: string
  icon?: string
  sort: number
  isVisible: boolean
  isSystem: boolean
  description?: string
  createdAt: string
  updatedAt?: string
  children?: Permission[]
  editing: boolean
}

export interface PermissionTree extends Permission {
  children?: PermissionTree[]
}

export interface CreatePermissionRequest {
  name: string
  code: string
  type: PermissionType
  parentId?: string
  path?: string
  component?: string
  icon?: string
  sort?: number
  isVisible?: boolean
  description?: string
}

export interface UpdatePermissionRequest {
  name?: string
  code?: string
  type?: PermissionType
  parentId?: string
  path?: string
  component?: string
  icon?: string
  sort?: number
  isVisible?: boolean
  description?: string
}

export interface PermissionQueryParams extends PageParams {
  name?: string
  code?: string
  type?: PermissionType
  parentId?: string
}

// 登录相关类型
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
  captcha?: string
}

export interface LoginResponse {
  token: string
  expiresIn: number
  refreshToken?: string
  tokenType: string
  user: User
  permissions: string[]
  roles: string[]
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  userId: string
  newPassword: string
}

// 菜单相关类型
export interface MenuItem {
  id: string
  title: string
  path: string
  name?: string
  icon?: string
  component?: string
  redirect?: string
  parentId?: string
  sort: number
  hidden: boolean
  alwaysShow?: boolean
  meta?: {
    title: string
    icon?: string
    noCache?: boolean
    affix?: boolean
    breadcrumb?: boolean
    activeMenu?: string
    permission?: string
  }
  children?: MenuItem[]
}

// 组织相关类型
export interface Organization {
  id: string
  name: string
  code: string
  parentId?: string
  sort: number
  status: number
  description?: string
  createdAt: string
  updatedAt?: string
  children?: Organization[]
}

export interface CreateOrganizationRequest {
  name: string
  code: string
  parentId?: string
  sort?: number
  status?: number
  description?: string
}

// 审计日志相关类型
export interface AuditLog {
  id: string
  userId?: string
  username?: string
  action: string
  module: string
  entityType: string
  entityId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  location?: string
  status: number
  message?: string
  createdAt: string
}

export interface AuditLogQueryParams extends PageParams {
  username?: string
  action?: string
  module?: string
  entityType?: string
  status?: number
  startTime?: string
  endTime?: string
}

// 字典相关类型
export interface Dict {
  id: string
  name: string
  code: string
  description?: string
  sort: number
  status: number
  createdAt: string
  items?: DictItem[]
}

export interface DictItem {
  id: string
  dictId: string
  label: string
  value: string
  color?: string
  sort: number
  status: number
  createdAt: string
}

// 系统配置相关类型
export interface SystemConfig {
  id: string
  key: string
  value: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt?: string
}

// 文件上传相关类型
export interface UploadFile {
  id: string
  filename: string
  originalName: string
  extension: string
  mimeType: string
  size: number
  path: string
  url: string
  bucket?: string
  userId?: string
  createdAt: string
}

export interface UploadResponse {
  file: UploadFile
  url: string
}

// 枚举类型
export enum PermissionType {
  MENU = 1,
  BUTTON = 2,
  API = 3
}

export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
  LOCKED = 2
}

export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

export enum AuditModule {
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  SYSTEM = 'SYSTEM',
  AUTH = 'AUTH'
}

export enum AuditStatus {
  SUCCESS = 1,
  FAILED = 0
}

// 树形数据工具类型
export interface TreeNode<T = any> {
  id: string
  parentId?: string
  children?: TreeNode<T>[]
  [key: string]: any
}

// 通用键值对类型
export interface KeyValue<T = any> {
  key: string
  value: T
  label?: string
  disabled?: boolean
}

// 下拉选项类型
export interface Option<T = any> {
  label: string
  value: T
  disabled?: boolean
  children?: Option<T>[]
}

// 查询条件类型
export interface QueryCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le' | 'like' | 'in' | 'notIn' | 'between' | 'isNull' | 'isNotNull'
  value: any
}

// 批量操作类型
export interface BatchOperation {
  ids: string[]
  operation: string
  params?: Record<string, any>
}

// 导出选项类型
export interface ExportOptions {
  format?: 'excel' | 'csv' | 'pdf'
  columns?: string[]
  filename?: string
}

// 导入结果类型
export interface ImportResult {
  total: number
  success: number
  failed: number
  errors?: Array<{
    row: number
    errors: string[]
  }>
  data?: any[]
}

// 系统信息类型
export interface SystemInfo {
  version: string
  name: string
  description?: string
  copyright?: string
  logo?: string
  favicon?: string
}

// 服务器状态类型
export interface ServerStatus {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  uptime: number
  requestCount: number
  errorCount: number
}

// 缓存统计类型
export interface CacheStats {
  size: number
  hitCount: number
  missCount: number
  hitRate: number
}

// 仪表盘统计类型
export interface DashboardStats {
  userCount: number
  roleCount: number
  permissionCount: number
  onlineUserCount: number
  todayLoginCount: number
  todayAuditCount: number
  systemLoad: number
}

// 图表数据点类型
export interface ChartDataPoint {
  x: string | number | Date
  y: number
  [key: string]: any
}

// 图表系列类型
export interface ChartSeries {
  name: string
  type: string
  data: ChartDataPoint[]
  [key: string]: any
}

// 图表配置类型
export interface ChartConfig {
  title?: string
  xAxis?: {
    type: string
    data?: any[]
    [key: string]: any
  }
  yAxis?: {
    type: string
    [key: string]: any
  }
  series: ChartSeries[]
  [key: string]: any
}
