<template>
  <!-- 应用根组件 -->
  <div id="app" :class="appClass">
    <!-- 路由占位符 -->
    <router-view v-slot="{ Component, route }">
      <!-- 路由过渡动画 -->
      <transition
        :name="route.meta.transition || 'fade-transform'"
        mode="out-in"
        @before-enter="handleBeforeEnter"
        @after-enter="handleAfterEnter"
        @before-leave="handleBeforeLeave"
      >
        <!-- keep-alive 缓存 -->
        <keep-alive :include="cachedViews">
          <!-- 组件渲染 -->
          <component
            :is="Component"
            :key="getRouteKey(route)"
            class="router-view"
          />
        </keep-alive>
      </transition>
    </router-view>

    <!-- 全局加载状态 -->
    <div v-if="globalLoading" class="global-loading">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span class="loading-text">加载中...</span>
      </div>
    </div>

    <!-- 全局消息提示容器（供函数调用） -->
    <div id="global-message-container"></div>

    <!-- 全局模态框容器（供函数调用） -->
    <div id="global-modal-container"></div>

    <!-- 水印（可选） -->
    <div v-if="showWatermark" class="watermark" :style="watermarkStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'
import { useAuthStore } from '@/store/modules/auth'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEventListener, useFullscreen } from '@vueuse/core'
import {} from '@/types/global'


const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

// 获取应用状态
const globalLoading = computed(() => appStore.loading)
const cachedViews = computed(() => appStore.cachedViews)
const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)

// 获取设置
const settings = computed(() => settingsStore.settings)
const fixedHeader = computed(() => settings.value.fixedHeader)
const showTagsView = computed(() => settings.value.showTagsView)
const showSidebarLogo = computed(() => settings.value.showSidebarLogo)
const showBreadcrumb = computed(() => settings.value.showBreadcrumb)
const showWatermark = computed(() => settings.value.showWatermark)

// 水印样式
const watermarkStyle = computed(() => {
  const userInfo = authStore.userInfo
  const text = userInfo ? `${userInfo.username} - RBAC系统` : 'RBAC权限管理系统'

  return {
    '--watermark-text': `"${text}"`,
    '--watermark-color': 'rgba(0, 0, 0, 0.06)'
  }
})

// 应用类名
const appClass = computed(() => ({
  'hide-sidebar': !sidebar.value.opened,
  'open-sidebar': sidebar.value.opened,
  'without-animation': sidebar.value.withoutAnimation,
  'mobile': device.value === 'mobile',
  'has-tags-view': showTagsView.value,
  'fixed-header': fixedHeader.value
}))

// 获取路由key
const getRouteKey = (route: any) => {
  // 使用路由路径作为key
  if (route.meta.usePathKey) {
    return route.path
  }

  // 使用路由名称作为key（默认）
  return route.name
}

// 路由切换动画钩子
const handleBeforeEnter = () => {
  // 页面切换开始
  appStore.setGlobalLoading(true)
}

const handleAfterEnter = () => {
  // 页面切换结束
  nextTick(() => {
    appStore.setGlobalLoading(false)
  })
}

const handleBeforeLeave = () => {
  // 离开页面前的处理
}

// 监听路由变化
watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log(`路由切换: ${oldPath} -> ${newPath}`)

    // 关闭移动端侧边栏
    if (device.value === 'mobile' && sidebar.value.opened) {
      appStore.closeSidebar(false)
    }

    // 记录页面访问
    recordPageView()

    // 检查是否需要权限验证
    checkRoutePermission(route)
  },
  { immediate: true }
)

// 监听路由参数变化
watch(
  () => route.query,
  () => {
    // 处理查询参数变化
  },
  { deep: true }
)

// 记录页面访问
const recordPageView = () => {
  const pageInfo = {
    path: route.path,
    name: route.name,
    fullPath: route.fullPath,
    meta: route.meta,
    timestamp: new Date().getTime(),
    user: authStore.userInfo
  }

  // 可以发送到统计服务
  console.log('页面访问记录:', pageInfo)
}

// 检查路由权限
const checkRoutePermission = (route: any) => {
  const requiredPermission = route.meta?.permission
  if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
    // 如果当前页面需要权限但用户没有权限，跳转到401页面
    if (route.path !== '/401') {
      router.push('/401')
    }
  }
}

// 窗口大小变化处理
const handleResize = () => {
  if (!document.hidden) {
    appStore.toggleDevice(document.body.clientWidth < 768 ? 'mobile' : 'desktop')

    if (document.body.clientWidth < 768) {
      appStore.closeSidebar(true)
    }
  }
}

// 键盘快捷键
const handleKeyDown = (e: KeyboardEvent) => {
  // Ctrl + Shift + L: 切换侧边栏
  if (e.ctrlKey && e.shiftKey && e.key === 'L') {
    e.preventDefault()
    appStore.toggleSidebar()
  }

  // F11: 切换全屏
  if (e.key === 'F11') {
    e.preventDefault()
    const { toggle } = useFullscreen()
    toggle()
  }

  // Esc: 关闭侧边栏（移动端）
  if (e.key === 'Escape' && device.value === 'mobile' && sidebar.value.opened) {
    appStore.closeSidebar(false)
  }
}

// 网络状态变化
const handleOnline = () => {
  ElMessage.success('网络已连接')
  appStore.setNetworkStatus(true)
}

const handleOffline = () => {
  ElMessage.warning('网络已断开')
  appStore.setNetworkStatus(false)
}

// 页面可见性变化
const handleVisibilityChange = () => {
  if (document.hidden) {
    console.log('页面隐藏')
  } else {
    console.log('页面显示')
  }
}

// 初始化应用
const initApp = async () => {
  try {
    // 设置窗口大小变化监听
    window.addEventListener('resize', handleResize)

    // 设置键盘快捷键监听
    document.addEventListener('keydown', handleKeyDown)

    // 监听网络状态
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 初始窗口大小判断
    handleResize()

    // 如果已登录，获取用户信息
    if (authStore.isLoggedIn && !authStore.hasUserInfo) {
      await authStore.getUserInfo()
    }

    // 初始化应用设置
    await settingsStore.initSettings()

    console.log('应用初始化完成')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 清理函数
const cleanup = () => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
}

// 生命周期钩子
onMounted(() => {
  initApp()
})

onUnmounted(() => {
  cleanup()
})

// 错误处理
const handleError = (error: Error) => {
  console.error('全局错误:', error)

  // 根据错误类型处理
  if (error.name === 'NetworkError') {
    ElMessage.error('网络错误，请检查网络连接')
  } else if (error.name === 'AuthError') {
    // 认证错误，跳转到登录页
    authStore.logout()
    router.push('/login')
  } else {
    ElMessage.error(`系统错误: ${error.message}`)
  }
}

// 全局错误监听
if (import.meta.env.DEV) {
  // 开发环境：显示完整错误
  window.addEventListener('error', (event) => {
    console.error('全局错误事件:', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason)
  })
} else {
  // 生产环境：优雅的错误处理
  window.addEventListener('error', (event) => {
    event.preventDefault()
    handleError(event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault()
    handleError(event.reason)
  })
}

// 暴露给window（用于调试）
// if (import.meta.env.DEV) {
//   window.__RBAC_APP__ = {
//     appStore,
//     settingsStore,
//     authStore,
//     router
//   }
// }
</script>

<style lang="scss">
// 导入全局样式
@import '@/assets/styles/index.scss';

#app {
  height: 100%;
  width: 100%;
  position: relative;
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f0f2f5;

  // 路由视图样式
  .router-view {
    height: 100%;
    width: 100%;
  }

  // 全局加载状态
  .global-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .loading-icon {
        font-size: 48px;
        color: var(--primary-color);
        animation: spin 1s linear infinite;
      }

      .loading-text {
        font-size: 16px;
        color: #666;
      }
    }
  }

  // 水印样式
  .watermark {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9998;
    opacity: 0.6;

    &::before {
      content: var(--watermark-text);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 60px;
      color: var(--watermark-color);
      font-weight: bold;
      white-space: nowrap;
      letter-spacing: 2px;
      user-select: none;
    }
  }

  // 移动端样式
  &.mobile {
    .sidebar-container {
      transition: transform 0.28s;
      width: var(--sidebar-width) !important;

      &.is-collapse {
        width: var(--sidebar-collapsed-width) !important;
      }
    }

    &.hide-sidebar {
      .sidebar-container {
        pointer-events: none;
        transition-duration: 0.3s;
        transform: translate3d(-var(--sidebar-width), 0, 0);
      }

      .main-container {
        margin-left: 0 !important;
      }
    }

    .main-container {
      margin-left: 0 !important;
    }
  }

  // 隐藏侧边栏
  &.hide-sidebar {
    .sidebar-container {
      width: 54px !important;
    }

    .main-container {
      margin-left: 54px !important;
    }

    .submenu-title-noDropdown {
      padding: 0 !important;
      position: relative;

      .el-tooltip {
        padding: 0 !important;

        .svg-icon {
          margin-left: 20px;
        }
      }
    }

    .el-submenu {
      overflow: hidden;

      & > .el-submenu__title {
        padding: 0 !important;

        .svg-icon {
          margin-left: 20px;
        }

        .el-submenu__icon-arrow {
          display: none;
        }
      }
    }
  }

  // 固定头部
  &.fixed-header {
    .header-container {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 9;
      width: calc(100% - var(--sidebar-width));
      transition: width 0.28s;

      @media (max-width: 1199px) {
        width: 100%;
      }
    }

    .main-container {
      padding-top: var(--header-height);
    }

    .tags-view-container {
      position: fixed;
      top: var(--header-height);
      right: 0;
      z-index: 8;
      width: calc(100% - var(--sidebar-width));
      transition: width 0.28s;

      @media (max-width: 1199px) {
        width: 100%;
      }
    }

    &.hide-sidebar {
      .header-container,
      .tags-view-container {
        width: calc(100% - 54px);

        @media (max-width: 1199px) {
          width: 100%;
        }
      }
    }

    &.mobile {
      .header-container,
      .tags-view-container {
        width: 100%;
      }
    }
  }

  // 标签页样式
  &.has-tags-view {
    .app-main {
      min-height: calc(100vh - var(--header-height) - var(--tags-view-height));
    }

    .fixed-header + .app-main {
      padding-top: calc(var(--header-height) + var(--tags-view-height));
    }
  }
}

// 路由过渡动画
// 淡入淡出
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 滑动淡入
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

// 缩放淡入
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}

.zoom-fade-enter-from {
  transform: scale(0.9);
  opacity: 0;
}

.zoom-fade-leave-to {
  transform: scale(1.1);
  opacity: 0;
}

// 渐入渐出移动
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// 面包屑过渡
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-leave-active {
  position: absolute;
}

// 旋转动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 脉冲动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;

  &:hover {
    background: #a8a8a8;
  }
}

// 打印样式
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  // 确保打印时背景色和文字颜色正确
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}

// 主题切换过渡
.theme-transition {
  &,
  &::before,
  &::after {
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }
}

// 响应式断点
@media (max-width: 1199px) {
  .hidden-lg {
    display: none !important;
  }
}

@media (max-width: 991px) {
  .hidden-md {
    display: none !important;
  }
}

@media (max-width: 767px) {
  .hidden-sm {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .desktop-only {
    display: none !important;
  }
}

@media (min-width: 768px) {
  .mobile-only {
    display: none !important;
  }

  .desktop-only {
    display: block !important;
  }
}

// 深色模式
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #409EFF;
    --success-color: #67C23A;
    --warning-color: #E6A23C;
    --danger-color: #F56C6C;
    --info-color: #909399;
    --text-color: #ffffff;
    --bg-color: #1a1a1a;
    --border-color: #424242;
  }

  #app {
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  .el-dialog,
  .el-card,
  .el-table {
    background-color: #2d2d2d;
    color: var(--text-color);
  }

  .el-table {
    --el-table-border-color: var(--border-color);
    --el-table-header-bg-color: #3a3a3a;
    --el-table-row-hover-bg-color: #3a3a3a;
  }

  .el-input,
  .el-select,
  .el-date-editor {
    --el-input-bg-color: #2d2d2d;
    --el-input-border-color: var(--border-color);
    --el-input-text-color: var(--text-color);
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  :root {
    --primary-color: #0066cc;
    --success-color: #267326;
    --warning-color: #996600;
    --danger-color: #cc0000;
  }

  * {
    border-width: 2px !important;
  }
}

// 减少动画（用户偏好）
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>

<!-- 辅助功能改进 -->
<script lang="ts">
// 辅助功能增强
export default {
  // 为屏幕阅读器提供页面标题
  computed: {
    pageTitle() {
      const route = useRoute()
      const title = route.meta?.title as string || 'RBAC权限管理系统'
      return `${title} - RBAC管理系统`
    }
  },

  watch: {
    pageTitle(newTitle) {
      document.title = newTitle
    }
  },

  mounted() {
    // 设置语言属性
    document.documentElement.lang = 'zh-CN'

    // 设置页面标题
    document.title = this.pageTitle

    // 为屏幕阅读器添加跳过导航链接
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-to-content'
    skipLink.textContent = '跳转到主要内容'
    skipLink.style.cssText = `
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    skipLink.addEventListener('focus', () => {
      skipLink.style.left = 'auto'
      skipLink.style.top = '0'
      skipLink.style.width = 'auto'
      skipLink.style.height = 'auto'
      skipLink.style.background = '#fff'
      skipLink.style.padding = '10px'
      skipLink.style.zIndex = '10000'
    })

    document.body.prepend(skipLink)

    // 为页面主要内容添加ID
    const mainContent = document.querySelector('.app-main')
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content'
    }
  }
}
</script>