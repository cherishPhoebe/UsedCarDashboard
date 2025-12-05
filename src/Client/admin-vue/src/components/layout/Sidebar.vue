<template>
  <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
    <!-- Logo区域 -->
    <div class="sidebar-logo" @click="toggleCollapse">
      <div class="logo-wrapper">
        <img v-if="!isCollapse" src="@/assets/images/logo.png" alt="logo" class="logo-image" />
        <img v-else src="@/assets/images/logo-mini.png" alt="logo" class="logo-image-mini" />
        <h1 v-if="!isCollapse" class="logo-title">{{ appTitle }}</h1>
      </div>
      <div class="collapse-button">
        <el-icon v-if="isCollapse" @click.stop="toggleCollapse"><Expand /></el-icon>
        <el-icon v-else @click.stop="toggleCollapse"><Fold /></el-icon>
      </div>
    </div>

    <!-- 菜单区域 -->
    <div class="sidebar-menu">
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          :collapse-transition="false"
          background-color="#001529"
          text-color="#b7bdc3"
          active-text-color="#ffffff"
          mode="vertical"
          @select="handleSelect"
        >
          <!-- 递归渲染菜单 -->
          <sidebar-item
            v-for="route in permissionRoutes"
            :key="route.path"
            :item="route"
            :base-path="route.path"
            :is-collapse="isCollapse"
          />
        </el-menu>
      </el-scrollbar>
    </div>

    <!-- 底部区域 -->
    <div class="sidebar-footer" v-if="!isCollapse">
      <div class="user-info">
        <el-avatar :size="32" :src="userInfo?.avatar" />
        <div class="user-details">
          <div class="user-name">{{ userInfo?.username }}</div>
          <div class="user-role">{{ userRole }}</div>
        </div>
      </div>
      <div class="footer-actions">
        <el-tooltip content="设置" placement="right">
          <el-button type="text" @click="openSettings">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="退出登录" placement="right">
          <el-button type="text" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="sidebar-footer-collapse" v-else>
      <el-dropdown @command="handleFooterCommand">
        <el-avatar :size="32" :src="userInfo?.avatar" />
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold, Setting, SwitchButton, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const appTitle = import.meta.env.VITE_APP_TITLE || 'RBAC管理系统'

// 响应式折叠状态
const isCollapse = computed(() => appStore.sidebar.opened)

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})

// 权限路由（过滤后的菜单）
const permissionRoutes = computed(() => {
  return authStore.menuPermissions
})

// 用户信息
const userInfo = computed(() => authStore.userInfo)

// 用户角色
const userRole = computed(() => {
  const roles = userInfo.value?.roles || []
  return roles.length > 0 ? roles[0].name : '普通用户'
})

// 切换折叠状态
const toggleCollapse = () => {
  appStore.toggleSidebar()
}

// 菜单选择
const handleSelect = (index: string) => {
  // 记录最近访问的菜单
  const route = permissionRoutes.value.find(r => r.path === index)
  if (route && route.meta?.title) {
    appStore.addVisitedRoute({
      path: index,
      title: route.meta.title as string
    })
  }
}

// 打开设置
const openSettings = () => {
  settingsStore.openSettings()
}

// 处理底部命令
const handleFooterCommand = (command: string) => {
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

// 退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 监听路由变化，自动展开对应的菜单
watch(
  () => route.path,
  () => {
    // 如果侧边栏是折叠状态，且当前路由有父级菜单，自动展开
    if (isCollapse.value) {
      const matched = route.matched
      if (matched.length > 1) {
        // 这里可以实现自动展开父级菜单的逻辑
      }
    }
  }
)
</script>

<style lang="scss" scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  width: var(--sidebar-width);
  height: 100%;
  background-color: #001529;
  transition: width 0.28s;
  overflow: hidden;

  &.is-collapse {
    width: var(--sidebar-collapsed-width);

    .sidebar-logo {
      justify-content: center;
      padding: 0;

      .logo-wrapper {
        .logo-image {
          display: none;
        }

        .logo-image-mini {
          display: block;
          width: 32px;
          height: 32px;
        }
      }

      .collapse-button {
        display: none;
      }
    }

    .el-menu--collapse {
      width: 100%;

      :deep(.el-sub-menu) {
        & > .el-sub-menu__title {
          padding: 0 20px !important;

          .el-sub-menu__icon-arrow {
            display: none;
          }

          .menu-icon {
            margin-right: 0;
          }

          span {
            display: none;
          }
        }
      }
    }
  }
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 16px;
  background-color: #002140;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #001f3d;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-image {
      width: 32px;
      height: 32px;
    }

    .logo-image-mini {
      display: none;
    }

    .logo-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
    }
  }

  .collapse-button {
    .el-icon {
      font-size: 18px;
      color: #ffffff;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #409EFF;
      }
    }
  }
}

.sidebar-menu {
  height: calc(100% - var(--header-height) - 80px);

  :deep(.el-scrollbar) {
    height: 100%;

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }

  :deep(.el-menu) {
    border-right: none;

    &.el-menu--collapse {
      .menu-icon {
        margin-right: 0;
      }
    }

    .el-menu-item,
    .el-sub-menu__title {
      height: 48px;
      line-height: 48px;

      &:hover {
        background-color: #000c17 !important;
      }

      &.is-active {
        background-color: #1890ff !important;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background-color: #1890ff;
        }
      }
    }

    .menu-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  }
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  padding: 16px;
  background-color: #002140;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .user-details {
      .user-name {
        font-size: 14px;
        color: #ffffff;
        margin-bottom: 4px;
      }

      .user-role {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.65);
      }
    }
  }

  .footer-actions {
    display: flex;
    justify-content: space-around;

    .el-button {
      color: rgba(255, 255, 255, 0.65);
      padding: 4px;

      &:hover {
        color: #ffffff;
        background-color: rgba(255, 255, 255, 0.1);
      }

      .el-icon {
        font-size: 18px;
      }
    }
  }
}

.sidebar-footer-collapse {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #002140;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .el-avatar {
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>