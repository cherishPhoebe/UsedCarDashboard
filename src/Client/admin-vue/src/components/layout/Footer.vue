<template>
  <div class="footer-container">
    <div class="footer-content">
      <!-- 左侧信息 -->
      <div class="footer-left">
        <div class="copyright">
          Copyright © {{ currentYear }}
          <el-link type="primary" :underline="false" href="https://example.com" target="_blank">
            RBAC管理系统
          </el-link>
          版权所有
        </div>
        <div class="links">
          <el-link :underline="false" @click="openLink('/about')">关于我们</el-link>
          <el-divider direction="vertical" />
          <el-link :underline="false" @click="openLink('/contact')">联系我们</el-link>
          <el-divider direction="vertical" />
          <el-link :underline="false" @click="openLink('/privacy')">隐私政策</el-link>
          <el-divider direction="vertical" />
          <el-link :underline="false" @click="openLink('/terms')">服务条款</el-link>
        </div>
      </div>

      <!-- 右侧信息 -->
      <div class="footer-right">
        <div class="version">
          <el-tag size="small" type="info">v{{ appVersion }}</el-tag>
        </div>
        <div class="status-indicator">
          <div class="status-dot" :class="{ 'status-online': isOnline, 'status-offline': !isOnline }"></div>
          <span class="status-text">{{ isOnline ? '在线' : '离线' }}</span>
        </div>
        <div class="system-time">
          <el-icon><Clock /></el-icon>
          {{ currentTime }}
        </div>
        <div class="quick-actions">
          <el-button type="text" size="small" @click="scrollToTop">
            <el-icon><Top /></el-icon>
            回到顶部
          </el-button>
          <el-button type="text" size="small" @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
            全屏
          </el-button>
          <el-button type="text" size="small" @click="printPage">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部工具栏（可选） -->
    <div v-if="showToolbar" class="footer-toolbar">
      <div class="toolbar-content">
        <div class="toolbar-item" @click="showHelp">
          <el-icon><QuestionFilled /></el-icon>
          <span>帮助</span>
        </div>
        <div class="toolbar-item" @click="showFeedback">
          <el-icon><ChatDotRound /></el-icon>
          <span>反馈</span>
        </div>
        <div class="toolbar-item" @click="showShortcuts">
          <el-icon><Keyboard /></el-icon>
          <span>快捷键</span>
        </div>
        <div class="toolbar-item" @click="toggleToolbar">
          <el-icon><ArrowUp /></el-icon>
          <span>收起</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFullscreen } from '@vueuse/core'
import {
  Clock,
  Top,
  FullScreen,
  Printer,
  QuestionFilled,
  ChatDotRound,
  Keyboard,
  ArrowUp
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

// 状态
const currentYear = ref(new Date().getFullYear())
const currentTime = ref('')
const isOnline = ref(navigator.onLine)
const showToolbar = ref(false)

// 全屏控制
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 打开链接
const openLink = (url: string) => {
  if (url.startsWith('http')) {
    window.open(url, '_blank')
  } else {
    // 这里可以处理内部路由
    console.log('打开链接:', url)
  }
}

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 打印页面
const printPage = () => {
  window.print()
}

// 显示帮助
const showHelp = () => {
  window.open('/help', '_blank')
}

// 显示反馈
const showFeedback = () => {
  ElMessage.info('反馈功能正在开发中')
}

// 显示快捷键
const showShortcuts = () => {
  ElMessage.info('快捷键功能正在开发中')
}

// 切换工具栏
const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value
}

// 网络状态监听
const handleOnline = () => {
  isOnline.value = true
  ElMessage.success('网络已连接')
}

const handleOffline = () => {
  isOnline.value = false
  ElMessage.warning('网络已断开')
}

// 定时器
let timer: number

onMounted(() => {
  // 初始化时间
  updateTime()
  timer = window.setInterval(updateTime, 1000)

  // 监听网络状态
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 监听滚动显示工具栏
  const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    showToolbar.value = scrollTop > 300
  }
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style lang="scss" scoped>
.footer-container {
  position: relative;
  background-color: #fafafa;
  border-top: 1px solid #e8e8e8;
  transition: all 0.3s;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  min-height: 56px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .copyright {
    font-size: 12px;
    color: #666;

    .el-link {
      margin: 0 4px;
      font-size: 12px;
    }
  }

  .links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;

    .el-link {
      font-size: 12px;
      color: #999;

      &:hover {
        color: #409EFF;
      }
    }

    .el-divider {
      margin: 0;
      background-color: #d9d9d9;
    }
  }
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .version {
    .el-tag {
      font-size: 10px;
    }
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 4px;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.status-online {
        background-color: #67C23A;
        animation: pulse 2s infinite;
      }

      &.status-offline {
        background-color: #F56C6C;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
        }
        70% {
          box-shadow: 0 0 0 6px rgba(103, 194, 58, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
        }
      }
    }

    .status-text {
      font-size: 12px;
      color: #666;
    }
  }

  .system-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #666;

    .el-icon {
      font-size: 14px;
    }
  }

  .quick-actions {
    display: flex;
    gap: 4px;

    .el-button {
      padding: 2px 8px;
      font-size: 12px;
      color: #999;

      &:hover {
        color: #409EFF;
      }

      .el-icon {
        font-size: 12px;
        margin-right: 2px;
      }
    }
  }
}

.footer-toolbar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .toolbar-content {
    display: flex;
    gap: 1px;
    background-color: #f5f7fa;
    border-radius: 8px;
    overflow: hidden;

    .toolbar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 12px;
      background: white;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 60px;

      &:hover {
        background-color: #f5f7fa;

        .el-icon {
          color: #409EFF;
        }

        span {
          color: #409EFF;
        }
      }

      .el-icon {
        font-size: 18px;
        color: #666;
        margin-bottom: 4px;
      }

      span {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>