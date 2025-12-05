<template>
  <div class="header-container">
    <!-- 左侧：面包屑和搜索 -->
    <div class="header-left">
      <!-- 面包屑导航 -->
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
          <span v-if="item.redirect === 'noRedirect' || item.meta.breadcrumb === false" class="no-redirect">
            {{ item.meta.title }}
          </span>
          <router-link v-else :to="item.path">
            {{ item.meta.title }}
          </router-link>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：操作按钮和用户信息 -->
    <div class="header-right">
      <!-- 搜索按钮 -->
      <div class="header-action search-action" @click="toggleSearch">
        <el-icon><Search /></el-icon>
      </div>

      <!-- 全屏按钮 -->
      <div class="header-action fullscreen-action" @click="toggleFullscreen">
        <el-icon v-if="isFullscreen"><FullScreen /></el-icon>
        <el-icon v-else><FullScreen /></el-icon>
      </div>

      <!-- 消息通知 -->
      <el-dropdown class="header-action" trigger="click" @command="handleMessageCommand">
        <div class="message-trigger">
          <el-icon><Bell /></el-icon>
          <span v-if="unreadCount > 0" class="message-badge">{{ unreadCount }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="message-dropdown">
            <el-dropdown-item v-if="messageList.length === 0" disabled>
              暂无新消息
            </el-dropdown-item>
            <template v-else>
              <el-dropdown-item
                v-for="message in messageList"
                :key="message.id"
                :class="{ 'unread': !message.read }"
                @click="viewMessage(message)"
              >
                <div class="message-item">
                  <div class="message-icon" :style="{ backgroundColor: message.color }">
                    <el-icon><component :is="message.icon" /></el-icon>
                  </div>
                  <div class="message-content">
                    <div class="message-title">{{ message.title }}</div>
                    <div class="message-time">{{ formatTime(message.time) }}</div>
                  </div>
                </div>
              </el-dropdown-item>
            </template>
            <el-dropdown-item divided @click="viewAllMessages">
              <el-icon><MessageBox /></el-icon>
              查看所有消息
            </el-dropdown-item>
            <el-dropdown-item @click="clearAllMessages">
              <el-icon><Delete /></el-icon>
              清空消息
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 语言切换 -->
      <el-dropdown class="header-action" trigger="click" @command="handleLanguageChange">
        <div class="language-trigger">
          <el-icon><Global /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN" :disabled="currentLanguage === 'zh-CN'">
              简体中文
            </el-dropdown-item>
            <el-dropdown-item command="en-US" :disabled="currentLanguage === 'en-US'">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户信息 -->
      <el-dropdown class="user-dropdown" trigger="click" @command="handleUserCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo?.avatar" />
          <div class="user-name">{{ userInfo?.username }}</div>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 设置按钮 -->
      <div class="header-action settings-action" @click="openSettings">
        <el-icon><Setting /></el-icon>
      </div>
    </div>

    <!-- 搜索面板 -->
    <div v-if="showSearch" class="search-panel">
      <div class="search-panel-content">
        <el-autocomplete
          v-model="searchQuery"
          placeholder="搜索菜单、功能、页面..."
          :fetch-suggestions="querySearch"
          @select="handleSearchSelect"
          @blur="closeSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #default="{ item }">
            <div class="search-result-item">
              <div class="search-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="search-content">
                <div class="search-title">{{ item.title }}</div>
                <div class="search-path">{{ item.path }}</div>
              </div>
            </div>
          </template>
        </el-autocomplete>
        <div class="search-hotkeys">
          <span class="hotkey-tip">快捷键：</span>
          <el-tag size="small" effect="plain">Ctrl + K</el-tag>
          <el-tag size="small" effect="plain">Esc</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFullscreen } from '@vueuse/core'
import {
  Search,
  FullScreen,
  Bell,
  Global,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  MessageBox,
  Delete
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// 搜索相关
const showSearch = ref(false)
const searchQuery = ref('')

// 消息相关
const messageList = ref([
  {
    id: 1,
    title: '系统更新通知',
    content: '系统将于今晚22:00进行维护更新',
    time: new Date().toISOString(),
    icon: 'Bell',
    color: '#409EFF',
    read: false
  },
  {
    id: 2,
    title: '权限变更提醒',
    content: '您的角色权限已更新',
    time: new Date(Date.now() - 3600000).toISOString(),
    icon: 'Key',
    color: '#67C23A',
    read: true
  },
  {
    id: 3,
    title: '安全提醒',
    content: '请及时修改密码',
    time: new Date(Date.now() - 7200000).toISOString(),
    icon: 'Warning',
    color: '#E6A23C',
    read: false
  }
])

const unreadCount = computed(() => {
  return messageList.value.filter(msg => !msg.read).length
})

// 面包屑
const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
})

// 用户信息
const userInfo = computed(() => authStore.userInfo)

// 当前语言
const currentLanguage = ref('zh-CN')

// 切换搜索面板
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    // 聚焦输入框
    setTimeout(() => {
      const input = document.querySelector('.search-panel .el-input__inner') as HTMLInputElement
      input?.focus()
    }, 100)
  }
}

// 搜索建议
const querySearch = (queryString: string, cb: Function) => {
  const results = queryString
    ? searchOptions.value.filter(option =>
        option.title.toLowerCase().includes(queryString.toLowerCase()) ||
        option.path.toLowerCase().includes(queryString.toLowerCase())
      )
    : searchOptions.value.slice(0, 5)
  cb(results)
}

// 搜索选项（从路由生成）
const searchOptions = computed(() => {
  const routes = router.getRoutes()
  const options: Array<{ title: string; path: string; icon: string }> = []

  routes.forEach(route => {
    if (route.meta && route.meta.title && route.meta.search !== false) {
      options.push({
        title: route.meta.title as string,
        path: route.path,
        icon: (route.meta.icon as string) || 'Menu'
      })
    }
  })

  return options
})

// 处理搜索选择
const handleSearchSelect = (item: any) => {
  router.push(item.path)
  showSearch.value = false
  searchQuery.value = ''
}

// 关闭搜索
const closeSearch = () => {
  setTimeout(() => {
    showSearch.value = false
    searchQuery.value = ''
  }, 200)
}

// 处理消息命令
const handleMessageCommand = (command: string) => {
  switch (command) {
    case 'viewAll':
      viewAllMessages()
      break
    case 'clearAll':
      clearAllMessages()
      break
  }
}

// 查看消息
const viewMessage = (message: any) => {
  message.read = true
  // 这里可以打开消息详情
  console.log('查看消息:', message)
}

// 查看所有消息
const viewAllMessages = () => {
  router.push('/system/message')
}

// 清空消息
const clearAllMessages = () => {
  messageList.value = []
}

// 切换语言
const handleLanguageChange = (lang: string) => {
  currentLanguage.value = lang
  // 这里应该实现国际化切换逻辑
  ElMessage.success('语言切换成功')
}

// 处理用户命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      openSettings()
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 打开设置
const openSettings = () => {
  settingsStore.openSettings()
}

// 退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl + K 打开搜索
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault()
    toggleSearch()
  }

  // Esc 关闭搜索
  if (e.key === 'Escape' && showSearch.value) {
    showSearch.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.header-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 20px;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1000;

  .header-left {
    display: flex;
    align-items: center;

    .breadcrumb {
      font-size: 14px;

      .no-redirect {
        color: #97a8be;
        cursor: text;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      .el-icon {
        font-size: 18px;
        color: #5a5e66;
      }

      &.search-action,
      &.fullscreen-action,
      &.settings-action {
        &:hover {
          .el-icon {
            color: #409EFF;
          }
        }
      }

      &.message-trigger {
        position: relative;

        .message-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-size: 10px;
          line-height: 16px;
          text-align: center;
          color: white;
          background-color: #f56c6c;
          border-radius: 8px;
        }
      }
    }

    .language-trigger {
      cursor: pointer;

      .el-icon {
        font-size: 20px;
        color: #5a5e66;
      }
    }

    .user-dropdown {
      cursor: pointer;

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        .user-name {
          font-size: 14px;
          color: #303133;
        }

        .el-icon {
          color: #c0c4cc;
        }
      }
    }
  }

  .search-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;

    .search-panel-content {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;

      :deep(.el-autocomplete) {
        width: 100%;

        .el-input__inner {
          height: 48px;
          font-size: 16px;
        }
      }

      .search-result-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;

        .search-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f7fa;
          border-radius: 4px;

          .el-icon {
            color: #409EFF;
          }
        }

        .search-content {
          flex: 1;

          .search-title {
            font-size: 14px;
            color: #303133;
            margin-bottom: 2px;
          }

          .search-path {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .search-hotkeys {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;

        .hotkey-tip {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

.message-dropdown {
  width: 320px;
  max-height: 400px;
  overflow-y: auto;

  .message-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .message-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      flex-shrink: 0;

      .el-icon {
        color: white;
      }
    }

    .message-content {
      flex: 1;
      min-width: 0;

      .message-title {
        font-size: 14px;
        color: #303133;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .message-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .unread {
    .message-title {
      font-weight: 600;
    }
  }
}
</style>