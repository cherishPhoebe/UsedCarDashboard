<template>
  <div class="redirect-container">
    <div class="redirect-content">
      <div class="redirect-loader">
        <el-progress
          type="circle"
          :percentage="progress"
          :stroke-width="8"
          :width="120"
          status="success"
        />
      </div>

      <div class="redirect-info">
        <h2 class="redirect-title">正在跳转...</h2>
        <p class="redirect-message">{{ message }}</p>

        <div class="redirect-target">
          <div class="target-label">目标页面：</div>
          <div class="target-url">{{ targetUrl }}</div>
        </div>

        <div class="redirect-actions">
          <el-button type="text" @click="cancelRedirect">
            <el-icon><Close /></el-icon>
            取消跳转
          </el-button>
          <el-button type="text" @click="goNow">
            <el-icon><Right /></el-icon>
            立即跳转
          </el-button>
        </div>

        <div class="redirect-tips">
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>页面将在 {{ countdown }} 秒后自动跳转</p>
              <p>如果您的浏览器没有自动跳转，请点击"立即跳转"按钮</p>
            </template>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, Right } from '@element-plus/icons-vue'
import { validate } from '@/utils/validate'

const route = useRoute()
const router = useRouter()

// 状态
const countdown = ref(3)
const redirectTimer = ref<NodeJS.Timeout | null>(null)
const progress = ref(0)

// 计算目标URL
const targetUrl = computed(() => {
  const { query } = route
  const path = query.path as string
  const fullPath = query.fullPath as string

  return path || fullPath || '/'
})

// 计算消息
const message = computed(() => {
  const { query } = route
  const from = query.from as string

  if (from) {
    return `正在从 ${from} 跳转到目标页面`
  }

  return '正在跳转到目标页面，请稍候...'
})

// 开始倒计时
const startCountdown = () => {
  // 清除现有定时器
  if (redirectTimer.value) {
    clearInterval(redirectTimer.value)
  }

  // 设置总时间（毫秒）
  const totalTime = 3000 // 3秒
  const interval = 50 // 每50毫秒更新一次
  const totalSteps = totalTime / interval
  let currentStep = 0

  // 进度条定时器
  const progressTimer = setInterval(() => {
    currentStep++
    progress.value = Math.min((currentStep / totalSteps) * 100, 100)
  }, interval)

  // 倒计时定时器
  redirectTimer.value = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      performRedirect()
    }
  }, 1000)

  // 保存定时器引用以便清理
  setTimeout(() => {
    clearInterval(progressTimer)
  }, totalTime)
}

// 执行跳转
const performRedirect = () => {
  const { query } = route

  try {
    // 获取跳转参数
    const path = query.path as string
    const fullPath = query.fullPath as string
    const queryParams = query.params as string

    let targetRoute = '/'

    if (path && validate.isValidPath(path)) {
      targetRoute = path
    } else if (fullPath && validate.isValidPath(fullPath.split('?')[0])) {
      targetRoute = fullPath
    }

    // 解析查询参数
    let routeParams = {}
    if (queryParams) {
      try {
        routeParams = JSON.parse(queryParams)
      } catch (e) {
        console.warn('Failed to parse query params:', e)
      }
    }

    // 执行跳转
    router.push({
      path: targetRoute,
      query: routeParams
    })
  } catch (error) {
    console.error('Redirect failed:', error)
    // 跳转失败，返回首页
    router.push('/')
  }
}

// 立即跳转
const goNow = () => {
  if (redirectTimer.value) {
    clearInterval(redirectTimer.value)
    redirectTimer.value = null
  }
  performRedirect()
}

// 取消跳转
const cancelRedirect = () => {
  if (redirectTimer.value) {
    clearInterval(redirectTimer.value)
    redirectTimer.value = null
  }

  // 返回到上一个页面或首页
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// 检查是否需要跳转
const shouldRedirect = () => {
  const { query } = route
  return query.path || query.fullPath
}

onMounted(() => {
  if (shouldRedirect()) {
    startCountdown()
  } else {
    // 没有跳转目标，返回首页
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }
})

onUnmounted(() => {
  if (redirectTimer.value) {
    clearInterval(redirectTimer.value)
    redirectTimer.value = null
  }
})
</script>

<style lang="scss" scoped>
.redirect-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.redirect-content {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  width: 100%;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    gap: 30px;
    margin: 20px;
  }
}

.redirect-loader {
  flex-shrink: 0;

  :deep(.el-progress-circle) {
    .el-progress-circle__track {
      stroke: #f0f0f0;
    }

    .el-progress-circle__path {
      stroke: #409EFF;
      transition: stroke-dasharray 0.1s linear;
    }
  }
}

.redirect-info {
  flex: 1;

  .redirect-title {
    margin: 0 0 15px;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .redirect-message {
    margin: 0 0 20px;
    font-size: 14px;
    color: #666;
    line-height: 1.6;
  }

  .redirect-target {
    margin-bottom: 25px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;

    .target-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .target-url {
      font-size: 14px;
      color: #409EFF;
      font-family: 'Courier New', monospace;
      word-break: break-all;
    }
  }

  .redirect-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .el-button {
      padding: 8px 16px;
      font-size: 14px;

      .el-icon {
        margin-right: 4px;
      }
    }
  }

  .redirect-tips {
    :deep(.el-alert) {
      padding: 12px 16px;

      .el-alert__content {
        p {
          margin: 4px 0;
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>