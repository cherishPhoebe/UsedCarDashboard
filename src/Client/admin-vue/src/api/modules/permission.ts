// src/api/modules/permission.ts
import { request } from '@/api/request'
import type {
  Permission,
  PermissionTree,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PageParams,
  PageResult,
  Result,
  BatchOperation,
  ImportResult
} from '../types'

export const permissionApi = {
  // 获取权限列表（分页）
  getList(params: PageParams & {
    name?: string
    code?: string
    type?: number
    parentId?: string
    isSystem?: boolean
    isVisible?: boolean
    startTime?: string
    endTime?: string
  }): Promise<Result<PageResult<Permission>>> {
    return request.get('/api/permissions', params)
  },

  // 获取权限详情
  getDetail(id: string): Promise<Result<Permission>> {
    return request.get(`/api/permissions/${id}`)
  },

  // 获取权限树
  getTree(): Promise<Result<PermissionTree[]>> {
    return request.get('/api/permissions/tree')
  },

  // 创建权限
  create(data: CreatePermissionRequest): Promise<Result<Permission>> {
    return request.post('/api/permissions', data)
  },

  // 更新权限
  update(id: string, data: UpdatePermissionRequest): Promise<Result<void>> {
    return request.put(`/api/permissions/${id}`, data)
  },

  // 删除权限
  delete(id: string): Promise<Result<void>> {
    return request.delete(`/api/permissions/${id}`)
  },

  // 批量删除权限
  batchDelete(ids: string[]): Promise<Result<void>> {
    return request.post('/api/permissions/batch-delete', { ids })
  },

  // 批量操作权限
  batchOperation(data: BatchOperation): Promise<Result<void>> {
    return request.post('/api/permissions/batch-operation', data)
  },

  // 导出权限列表
  export(params: any): Promise<any> {
    return request.get('/api/permissions/export', params, {
      responseType: 'blob'
    })
  },

  // 导出权限模板
  exportTemplate(): Promise<any> {
    return request.get('/api/permissions/export-template', {}, {
      responseType: 'blob'
    })
  },

  // 导入权限
  import(data: FormData): Promise<Result<ImportResult>> {
    return request.post('/api/permissions/import', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取权限选项（用于选择器）
  getOptions(): Promise<Result<Array<{ label: string; value: string }>>> {
    return request.get('/api/permissions/options')
  },

  // 验证权限编码是否唯一
  validateCode(code: string, id?: string): Promise<Result<{ valid: boolean; message?: string }>> {
    return request.post('/api/permissions/validate-code', { code, id })
  },

  // 同步系统权限（重新加载系统权限到数据库）
  syncSystemPermissions(): Promise<Result<void>> {
    return request.post('/api/permissions/sync-system')
  },

  // 获取权限统计信息
  getStats(): Promise<Result<{
    total: number
    menuCount: number
    buttonCount: number
    apiCount: number
    systemCount: number
    visibleCount: number
  }>> {
    return request.get('/api/permissions/stats')
  }
}