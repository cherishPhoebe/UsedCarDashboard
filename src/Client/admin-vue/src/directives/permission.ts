import type { Directive } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

export const permission: Directive = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const { value } = binding

    if (value && Array.isArray(value)) {
      const hasPermission = value.some(permission =>
        authStore.permissions.includes(permission)
      )
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else if (value && typeof value === 'string') {
      if (!authStore.permissions.includes(value)) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}