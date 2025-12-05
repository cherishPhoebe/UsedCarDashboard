import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 基础路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      hidden: true,
      title: '登录'
    }
  },
  {
    path: '/redirect',
    component: () => import('@/views/redirect/Index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'dashboard',
          affix: true
        }
      }
    ]
  },
  {
    path: '/401',
    name: 'Unauthorized',
    component: () => import('@/views/error/401.vue'),
    meta: { hidden: true, title: '401' }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true, title: '404' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 动态路由（根据权限生成）
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: {
      title: '系统管理',
      icon: 'system',
      alwaysShow: true
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/Index.vue'),
        meta: {
          title: '用户管理',
          icon: 'user',
          permission: 'system:user:view'
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/Index.vue'),
        meta: {
          title: '角色管理',
          icon: 'role',
          permission: 'system:role:view'
        }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/system/permission/Index.vue'),
        meta: {
          title: '权限管理',
          icon: 'permission',
          permission: 'system:permission:view'
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { hidden: true },
    children: [
      {
        path: 'index',
        name: 'ProfileIndex',
        component: () => import('@/views/profile/Index.vue'),
        meta: {
          title: '个人中心',
          icon: 'profile'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 进度条配置
NProgress.configure({ showSpinner: false })

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const authStore = useAuthStore()

  // 判断是否登录页
  if (to.path === '/login') {
    if (authStore.isLoggedIn) {
      next('/dashboard')
      NProgress.done()
    } else {
      next()
    }
    return
  }

  // 检查是否登录
  if (!authStore.isLoggedIn) {
    next(`/login?redirect=${to.path}`)
    NProgress.done()
    return
  }

  // 检查是否已加载用户信息
  if (!authStore.hasUserInfo) {
    try {
      await authStore.getUserInfo()
    } catch (error) {
      await authStore.logout()
      next(`/login?redirect=${to.path}`)
      NProgress.done()
      return
    }
  }

  // 检查权限
  const hasPermission = checkPermission(to, authStore.permissions)
  if (!hasPermission) {
    next('/401')
    NProgress.done()
    return
  }

  // 设置页面标题
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - RBAC管理系统`
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

// 权限检查函数
function checkPermission(route: any, permissions: string[]): boolean {
  const requiredPermission = route.meta?.permission
  if (!requiredPermission) return true
  return permissions.includes(requiredPermission)
}

// 动态添加路由
export function addRoutes(routes: RouteRecordRaw[]) {
  routes.forEach(route => {
    if (!router.hasRoute(route.name as string)) {
      router.addRoute('Layout', route)
    }
  })
}

// 重置路由
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: constantRoutes
  })
  //router.matcher = newRouter.matcher
}

export default router