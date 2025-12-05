// API响应结构
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
  sortOrder?: 'ascend' | 'descend'
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
  email: string
  password: string
  phone?: string
  roleIds?: string[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  phone?: string
  status?: number
  roleIds?: string[]
}

// 角色相关类型
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  isSystem: boolean
  createdAt: string
  permissions?: Permission[]
}

export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  permissionIds?: string[]
}

// 权限相关类型
export interface Permission {
  id: string
  name: string
  code: string
  type: number // 1:菜单 2:按钮 3:接口
  parentId?: string
  path?: string
  component?: string
  icon?: string
  sort: number
  children?: Permission[]
}

export interface PermissionTree extends Permission {
  children?: PermissionTree[]
}

// 登录相关类型
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  token: string
  expiresIn: number
  user: User
  permissions: string[]
}