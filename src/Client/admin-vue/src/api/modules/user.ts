import { request } from '@/api/request'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PageParams,
  PageResult,
  Result
} from '../types'

export const userApi = {
  // 获取用户列表（分页）
  getList(params: PageParams & {
    username?: string
    email?: string
    phone?: string
    status?: number
    roleId?: string
  }): Promise<Result<PageResult<User>>> {
    return request.get('/api/users', params)
  },

  // 获取用户详情
  getDetail(id: string): Promise<Result<User>> {
    return request.get(`/api/users/${id}`)
  },

  // 创建用户
  create(data: CreateUserRequest): Promise<Result<User>> {
    return request.post('/api/users', data)
  },

  // 更新用户
  update(id: string, data: UpdateUserRequest): Promise<Result<void>> {
    return request.put(`/api/users/${id}`, data)
  },

  // 删除用户
  delete(id: string): Promise<Result<void>> {
    return request.delete(`/api/users/${id}`)
  },

  // 批量删除用户
  batchDelete(ids: string[]): Promise<Result<void>> {
    return request.post('/api/users/batch-delete', { ids })
  },

  // 更新用户状态
  updateStatus(id: string, status: number): Promise<Result<void>> {
    return request.post(`/api/users/${id}/status`, { status })
  },

  // 重置用户密码
  resetPassword(id: string, newPassword: string): Promise<Result<void>> {
    return request.post(`/api/users/${id}/reset-password`, { newPassword })
  },

  // 分配角色给用户
  assignRoles(id: string, roleIds: string[]): Promise<Result<void>> {
    return request.post(`/api/users/${id}/assign-roles`, { roleIds })
  },

  // 移除用户的角色
  removeRoles(id: string, roleIds: string[]): Promise<Result<void>> {
    return request.post(`/api/users/${id}/remove-roles`, { roleIds })
  },

  // 导出用户列表
  // export(params: any): Promise<any> {
  //   return request.get('/api/users/export', params, {
  //     responseType: 'blob'
  //   })
  // },

  // 导入用户
  // import(file: File): Promise<Result<any>> {
  //   const formData = new FormData()
  //   formData.append('file', file)
  //   return request.post('/api/users/import', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  // },

  // 获取用户权限树
  getPermissionTree(): Promise<Result<any[]>> {
    return request.get('/api/users/permission-tree')
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<Result<User>> {
    return request.get('/api/users/current')
  },

  // 更新当前用户信息
  updateCurrentUser(data: Partial<User>): Promise<Result<void>> {
    return request.put('/api/users/current', data)
  },

  // 修改当前用户密码
  changePassword(data: {
    oldPassword: string
    newPassword: string
  }): Promise<Result<void>> {
    return request.post('/api/users/change-password', data)
  },

  // // 上传用户头像
  // uploadAvatar(file: File): Promise<Result<{ url: string }>> {
  //   const formData = new FormData()
  //   formData.append('file', file)
  //   return request.post('/api/users/avatar', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  // }

}