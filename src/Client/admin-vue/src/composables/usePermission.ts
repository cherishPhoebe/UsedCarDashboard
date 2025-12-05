import { computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

export function usePermission() {
  const authStore = useAuthStore()

  // 检查权限
  const hasPermission = (permission: string | string[]) => {
    if (!permission) return true

    if (Array.isArray(permission)) {
      return permission.some(p => authStore.permissions.includes(p))
    }

    return authStore.permissions.includes(permission)
  }

  // 检查角色
  const hasRole = (roleCode: string | string[]) => {
    const userRoles = authStore.userInfo?.roles || []
    const userRoleCodes = userRoles.map(role => role.code)

    if (Array.isArray(roleCode)) {
      return roleCode.some(code => userRoleCodes.includes(code))
    }

    return userRoleCodes.includes(roleCode)
  }

  return {
    hasPermission,
    hasRole,
    permissions: computed(() => authStore.permissions),
    menuPermissions: computed(() => authStore.menuPermissions)
  }
}