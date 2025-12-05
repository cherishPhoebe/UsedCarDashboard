<template>
  <div class="error-page error-401">
    <div class="error-container">
      <div class="error-content">
        <div class="error-code">401</div>
        <div class="error-message">抱歉，您没有访问权限！</div>
        <div class="error-desc">
          您当前没有权限访问此页面，可能是以下原因导致：
        </div>
        <ul class="error-reasons">
          <li>您的账户权限不足</li>
          <li>您访问的页面需要特定角色</li>
          <li>您访问的资源已被管理员限制</li>
          <li>您的会话已过期</li>
        </ul>
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
          <el-button @click="contactAdmin">
            <el-icon><Service /></el-icon>
            联系管理员
          </el-button>
          <el-button @click="refreshPage">
            <el-icon><Refresh /></el-icon>
            刷新页面
          </el-button>
        </div>
        <div class="error-tips">
          <p>如需获取访问权限，请联系系统管理员或切换拥有权限的账户登录。</p>
        </div>
      </div>
      <div class="error-illustration">
        <img src="@/assets/images/error-401.svg" alt="401错误" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft, Service, Refresh } from '@element-plus/icons-vue'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 联系管理员
const contactAdmin = () => {
  // 这里可以打开联系管理员的面板或者发送邮件
  window.location.href = 'mailto:admin@example.com'
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  &.error-401 {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
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
    color: #ff4d4f;
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
    margin-bottom: 20px;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  .error-desc {
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .error-reasons {
    margin: 0 0 30px 20px;
    padding: 0;

    li {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      line-height: 1.6;

      &:before {
        content: '•';
        color: #ff4d4f;
        font-weight: bold;
        display: inline-block;
        width: 1em;
        margin-left: -1em;
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

  .error-tips {
    padding: 15px;
    background: rgba(255, 77, 79, 0.1);
    border-radius: 6px;
    border-left: 4px solid #ff4d4f;

    p {
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.6;
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
</style>