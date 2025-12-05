<template>
  <div class="error-page error-500">
    <div class="error-container">
      <div class="error-content">
        <div class="error-code">500</div>
        <div class="error-message">抱歉，服务器发生错误！</div>
        <div class="error-desc">
          服务器内部错误，请稍后再试。如果问题持续存在，请联系管理员。
        </div>

        <div class="error-details" v-if="showDetails">
          <div class="details-title">错误详情：</div>
          <pre class="details-content">{{ errorDetails }}</pre>
        </div>

        <div class="error-troubleshoot">
          <div class="troubleshoot-title">您可以尝试以下方法：</div>
          <el-steps direction="vertical" :active="4" class="troubleshoot-steps">
            <el-step title="刷新页面">
              <template #description>
                <p>点击下方刷新按钮或按 F5 重新加载页面</p>
              </template>
            </el-step>
            <el-step title="检查网络连接">
              <template #description>
                <p>确保您的网络连接正常，尝试访问其他网站确认</p>
              </template>
            </el-step>
            <el-step title="清理浏览器缓存">
              <template #description>
                <p>清理浏览器缓存和Cookie后重试</p>
              </template>
            </el-step>
            <el-step title="联系技术支持">
              <template #description>
                <p>如果以上方法都无法解决问题，请联系技术支持</p>
              </template>
            </el-step>
          </el-steps>
        </div>

        <div class="error-actions">
          <el-button type="primary" size="large" @click="refreshPage">
            <el-icon><Refresh /></el-icon>
            刷新页面
          </el-button>
          <el-button size="large" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="toggleDetails">
            <el-icon><View /></el-icon>
            {{ showDetails ? '隐藏' : '显示' }}详情
          </el-button>
          <el-button size="large" @click="contactSupport">
            <el-icon><Headset /></el-icon>
            联系支持
          </el-button>
        </div>

        <div class="error-status">
          <div class="status-item">
            <span class="status-label">当前时间：</span>
            <span class="status-value">{{ currentTime }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">错误时间：</span>
            <span class="status-value">{{ errorTime }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">错误ID：</span>
            <span class="status-value">{{ errorId }}</span>
            <el-button type="text" size="small" @click="copyErrorId">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <div class="error-illustration">
        <img src="@/assets/images/error-500.svg" alt="500错误" />
      </div>
    </div>

    <!-- 服务状态 -->
    <div class="service-status">
      <div class="status-title">服务状态监控</div>
      <div class="status-list">
        <div class="status-item" :class="{ 'status-ok': isServiceOk('api'), 'status-error': !isServiceOk('api') }">
          <span class="status-name">API服务</span>
          <el-tag :type="isServiceOk('api') ? 'success' : 'danger'" size="small">
            {{ isServiceOk('api') ? '正常' : '异常' }}
          </el-tag>
        </div>
        <div class="status-item" :class="{ 'status-ok': isServiceOk('database'), 'status-error': !isServiceOk('database') }">
          <span class="status-name">数据库服务</span>
          <el-tag :type="isServiceOk('database') ? 'success' : 'danger'" size="small">
            {{ isServiceOk('database') ? '正常' : '异常' }}
          </el-tag>
        </div>
        <div class="status-item" :class="{ 'status-ok': isServiceOk('cache'), 'status-error': !isServiceOk('cache') }">
          <span class="status-name">缓存服务</span>
          <el-tag :type="isServiceOk('cache') ? 'success' : 'danger'" size="small">
            {{ isServiceOk('cache') ? '正常' : '异常' }}
          </el-tag>
        </div>
        <div class="status-item" :class="{ 'status-ok': isServiceOk('auth'), 'status-error': !isServiceOk('auth') }">
          <span class="status-name">认证服务</span>
          <el-tag :type="isServiceOk('auth') ? 'success' : 'danger'" size="small">
            {{ isServiceOk('auth') ? '正常' : '异常' }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  HomeFilled,
  View,
  Headset,
  CopyDocument
} from '@element-plus/icons-vue'

const router = useRouter()

// 错误信息
const showDetails = ref(false)
const errorId = ref(`ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`)
const errorTime = ref('')
const currentTime = ref('')

// 错误详情
const errorDetails = ref(`Error ID: ${errorId.value}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Error Message: Internal Server Error
Stack Trace:
  at Server.processRequest (/api/v1/users)
  at Router.handleRoute (/routes/user.js:45:12)
  at Application.handleRequest (/app.js:89:23)
  at Server.emit (events.js:400:28)
  at Server.emit (domain.js:475:12)
  at parserOnIncoming (http.js:962:12)
  at HTTPParser.parserOnHeadersComplete (http.js:149:23)`)

// 服务状态
const serviceStatus = ref({
  api: false,
  database: false,
  cache: false,
  auth: false
})

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 切换错误详情显示
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// 联系技术支持
const contactSupport = () => {
  window.open('https://support.example.com', '_blank')
}

// 复制错误ID
const copyErrorId = async () => {
  try {
    await navigator.clipboard.writeText(errorId.value)
    ElMessage.success('错误ID已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 检查服务状态
const isServiceOk = (service: keyof typeof serviceStatus.value) => {
  return serviceStatus.value[service]
}

// 模拟检查服务状态
const checkServiceStatus = () => {
  // 这里应该调用API检查服务状态
  // 暂时模拟随机状态
  serviceStatus.value = {
    api: Math.random() > 0.3,
    database: Math.random() > 0.2,
    cache: Math.random() > 0.4,
    auth: Math.random() > 0.3
  }
}

// 更新时间
const updateTime = () => {
  currentTime.value = formatTime(new Date())
}

// 定时器
let timer: number

onMounted(() => {
  // 设置错误时间
  errorTime.value = formatTime(new Date())

  // 更新时间
  updateTime()

  // 检查服务状态
  checkServiceStatus()

  // 设置定时器
  timer = window.setInterval(() => {
    updateTime()
    checkServiceStatus()
  }, 5000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  &.error-500 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  padding: 40px;
  gap: 60px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    margin: 20px;
  }
}

.error-content {
  flex: 1;

  .error-code {
    font-size: 120px;
    font-weight: 900;
    color: #f56c6c;
    line-height: 1;
    margin-bottom: 20px;
    text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      font-size: 80px;
    }
  }

  .error-message {
    font-size: 32px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  .error-desc {
    font-size: 16px;
    color: #666;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .error-details {
    margin-bottom: 30px;
    text-align: left;

    .details-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }

    .details-content {
      padding: 15px;
      background: #f5f5f5;
      border-radius: 6px;
      border: 1px solid #e8e8e8;
      font-size: 12px;
      color: #666;
      line-height: 1.5;
      max-height: 200px;
      overflow: auto;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  .error-troubleshoot {
    margin-bottom: 30px;
    text-align: left;

    .troubleshoot-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
    }

    .troubleshoot-steps {
      :deep(.el-step__head) {
        color: #f56c6c;
      }

      :deep(.el-step__title) {
        font-size: 14px;
        color: #333;
      }

      :deep(.el-step__description) {
        font-size: 12px;
        color: #666;

        p {
          margin: 0;
        }
      }
    }
  }

  .error-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 30px;

    .el-button {
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 6px;

      .el-icon {
        margin-right: 6px;
      }
    }
  }

  .error-status {
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    text-align: left;

    .status-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .status-label {
        font-size: 14px;
        color: #666;
        min-width: 80px;
      }

      .status-value {
        font-size: 14px;
        color: #333;
        font-family: 'Courier New', monospace;
        flex: 1;
        margin-right: 10px;
      }

      .el-button {
        padding: 2px 8px;
        min-height: auto;
      }
    }
  }
}

.error-illustration {
  flex: 1;
  display: flex;
  justify-content: center;

  img {
    max-width: 100%;
    height: auto;
    max-height: 400px;
  }

  @media (max-width: 992px) {
    max-width: 400px;
  }
}

.service-status {
  margin-top: 30px;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);

  .status-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }

  .status-list {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;

    .status-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 15px 25px;
      border-radius: 8px;
      transition: all 0.3s;

      &.status-ok {
        background: rgba(103, 194, 58, 0.1);
        border: 1px solid rgba(103, 194, 58, 0.3);
      }

      &.status-error {
        background: rgba(245, 108, 108, 0.1);
        border: 1px solid rgba(245, 108, 108, 0.3);
        animation: pulse 2s infinite;
      }

      .status-name {
        font-size: 14px;
        color: #666;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
        }
      }
    }
  }
}
</style>