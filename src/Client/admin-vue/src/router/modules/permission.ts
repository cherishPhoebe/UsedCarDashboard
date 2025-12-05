// src/router/modules/permission.ts
import type { RouteRecordExtended } from '@/types/router'

export const permissionRoutes: RouteRecordExtended[] = [
  {
    path: '/system/permission',
    name: 'Permission',
    component: () => import('@/views/system/permission/Index.vue'),
    meta: {
      title: '权限管理',
      icon: 'Key',
      permission: 'system:permission:view',
      keepAlive: true
    }
  }
]

export default permissionRoutes