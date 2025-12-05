<template>
  <div class="error-page error-404">
    <div class="error-container">
      <div class="error-content">
        <div class="error-code">404</div>
        <div class="error-message">抱歉，您访问的页面不存在！</div>
        <div class="error-desc">
          您访问的页面可能已被删除、移动或暂时不可用。
        </div>
        <div class="error-search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索您需要的内容..."
            size="large"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="error-suggestions">
          <p class="suggestions-title">您可以尝试：</p>
          <div class="suggestions-list">
            <div class="suggestion-item" @click="goHome">
              <div class="suggestion-icon">
                <el-icon><HomeFilled /></el-icon>
              </div>
              <div class="suggestion-content">
                <h4>返回首页</h4>
                <p>回到系统主页面重新开始</p>
              </div>
            </div>
            <div class="suggestion-item" @click="goBack">
              <div class="suggestion-icon">
                <el-icon><ArrowLeft /></el-icon>
              </div>
              <div class="suggestion-content">
                <h4>返回上一页</h4>
                <p>回到您之前浏览的页面</p>
              </div>
            </div>
            <div class="suggestion-item" @click="goDashboard">
              <div class="suggestion-icon">
                <el-icon><DataBoard /></el-icon>
              </div>
              <div class="suggestion-content">
                <h4>前往仪表盘</h4>
                <p>查看系统数据概览</p>
              </div>
            </div>
            <div class="suggestion-item" @click="goHelp">
              <div class="suggestion-icon">
                <el-icon><QuestionFilled /></el-icon>
              </div>
              <div class="suggestion-content">
                <h4>查看帮助文档</h4>
                <p>获取系统使用帮助</p>
              </div>
            </div>
          </div>
        </div>
        <div class="error-actions">
          <el-button type="primary" size="large" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
          <el-button size="large" @click="reportIssue">
            <el-icon><Warning /></el-icon>
            报告问题
          </el-button>
        </div>
      </div>
      <div class="error-illustration">
        <img src="@/assets/images/error-404.svg" alt="404错误" />
      </div>
    </div>

    <!-- 最近访问 -->
    <div class="recent-pages" v-if="recentPages.length > 0">
      <div class="recent-title">最近访问的页面：</div>
      <div class="recent-list">
        <el-tag
          v-for="page in recentPages"
          :key="page.path"
          class="recent-tag"
          @click="goToPage(page.path)"
        >
          {{ page.title }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  HomeFilled,
  ArrowLeft,
  DataBoard,
  QuestionFilled,
  Warning
} from '@element-plus/icons-vue'
import { storage } from '@/utils/storage'

const router = useRouter()
const searchQuery = ref('')

// 最近访问的页面
const recentPages = ref<Array<{ path: string; title: string }>>([])

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 前往仪表盘
const goDashboard = () => {
  router.push('/dashboard')
}

// 前往帮助页面
const goHelp = () => {
  window.open('/help', '_blank')
}

// 搜索处理
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 这里可以实现搜索功能
    console.log('搜索:', searchQuery.value)
  }
}

// 报告问题
const reportIssue = () => {
  const email = 'support@example.com'
  const subject = '页面404错误报告'
  const body = `错误页面: ${window.location.href}\n问题描述: \n`
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// 前往页面
const goToPage = (path: string) => {
  router.push(path)
}

// 获取最近访问的页面
const getRecentPages = () => {
  const pages = storage.get('recentPages')
  if (pages && Array.isArray(pages)) {
    recentPages.value = pages.slice(0, 8) // 最多显示8个
  }
}

onMounted(() => {
  getRecentPages()
})
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);

  &.error-404 {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  padding: 40px;
  gap: 60px;

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.error-content {
  flex: 1;

  .error-code {
    font-size: 120px;
    font-weight: 900;
    color: #1890ff;
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

  .error-search {
    margin-bottom: 30px;

    :deep(.el-input-group__append) {
      background-color: #1890ff;
      color: white;
      border-color: #1890ff;

      .el-button {
        color: white;
      }
    }
  }

  .error-suggestions {
    margin-bottom: 30px;

    .suggestions-title {
      font-size: 16px;
      color: #666;
      margin-bottom: 15px;
    }

    .suggestions-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .suggestion-item {
        display: flex;
        align-items: center;
        padding: 15px;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        border: 1px solid #e8e8e8;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #1890ff;
        }

        .suggestion-icon {
          width: 40px;
          height: 40px;
          background: #1890ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          flex-shrink: 0;

          .el-icon {
            color: white;
            font-size: 20px;
          }
        }

        .suggestion-content {
          flex: 1;
          text-align: left;

          h4 {
            margin: 0 0 5px;
            font-size: 14px;
            color: #333;
          }

          p {
            margin: 0;
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }

  .error-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .el-button {
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 6px;

      .el-icon {
        margin-right: 6px;
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

.recent-pages {
  max-width: 1200px;
  width: 100%;
  padding: 20px 40px;
  margin-top: 20px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  .recent-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
  }

  .recent-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .recent-tag {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #1890ff;
        color: white;
        transform: translateY(-1px);
      }
    }
  }
}
</style>