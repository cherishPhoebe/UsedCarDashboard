<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="login-bg-mask"></div>
    </div>

    <div class="login-wrapper">
      <div class="login-header">
        <div class="logo">
          <img src="@/assets/images/logo.png" alt="logo" />
          <h1>{{ appTitle }}</h1>
        </div>
        <p class="description">RBAC权限管理系统</p>
      </div>

      <div class="login-form">
        <h2 class="form-title">用户登录</h2>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名/邮箱"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item v-if="showCaptcha" prop="captcha">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                class="captcha-input"
              />
              <div class="captcha-image" @click="refreshCaptcha">
                <img :src="captchaImage" alt="验证码" />
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.rememberMe">
              记住我
            </el-checkbox>
            <el-link type="primary" class="forgot-password" :underline="false">
              忘记密码?
            </el-link>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p class="tips">
            温馨提示：请使用公司分配的账号登录，如有问题请联系管理员
          </p>
          <div class="version">版本: {{ appVersion }}</div>
        </div>
      </div>

      <div class="login-footer-bottom">
        <p>© 2023 RBAC权限管理系统. All rights reserved.</p>
      </div>
    </div>

    <!-- 语言选择 -->
    <div class="lang-select">
      <el-dropdown @command="handleLanguageChange">
        <span class="lang-trigger">
          <el-icon><Global /></el-icon>
          {{ currentLanguage }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
            <el-dropdown-item command="en-US">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Lock, Key, Global } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'
import { storage } from '@/utils/storage'
import { validate } from '@/utils/validate'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const appTitle = import.meta.env.VITE_APP_TITLE || 'RBAC管理系统'
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  rememberMe: true
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '长度在 4 到 6 个字符', trigger: 'blur' }
  ]
}

// 状态
const loading = ref(false)
const showCaptcha = ref(false)
const captchaImage = ref('')
const currentLanguage = ref('简体中文')

// 从记住我中读取用户名
onMounted(() => {
  const rememberInfo = storage.get('rememberMe')
  if (rememberInfo) {
    loginForm.username = rememberInfo.username || ''
    loginForm.rememberMe = true
  }

  // 监听回车键
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !loading.value) {
    handleLogin()
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  // 这里应该调用获取验证码的API
  captchaImage.value = `https://dummyimage.com/120x40/409EFF/fff&text=${Math.random().toString(36).substr(2, 4)}`
}

// 切换语言
const handleLanguageChange = (lang: string) => {
  currentLanguage.value = lang === 'zh-CN' ? '简体中文' : 'English'
  // 这里应该实现国际化切换逻辑
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 验证表单
    await loginFormRef.value.validate()

    // 显示加载状态
    loading.value = true

    // 保存记住我
    if (loginForm.rememberMe) {
      storage.set('rememberMe', { username: loginForm.username }, 30)
    } else {
      storage.remove('rememberMe')
    }

    // 调用登录API
    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      rememberMe: loginForm.rememberMe
    })

    // 登录成功，跳转到首页或重定向页面
    const redirect = route.query.redirect as string
    if (redirect && validate.isValidPath(redirect)) {
      router.push(redirect)
    } else {
      router.push('/')
    }

    ElMessage.success('登录成功！')
  } catch (error: any) {
    console.error('登录失败:', error)

    // 显示验证码
    if (!showCaptcha.value) {
      showCaptcha.value = true
      refreshCaptcha()
    }

    // 显示错误信息
    const errorMsg = error.message || '登录失败，请检查用户名和密码'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;

  &-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }
}

.login-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;

    img {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #fff;
    }
  }

  .description {
    margin: 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

  .form-title {
    margin: 0 0 30px;
    font-size: 24px;
    font-weight: 600;
    color: #333;
    text-align: center;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      padding: 0 15px;
    }

    .el-input__inner {
      height: 48px;
      line-height: 48px;
    }
  }

  .captcha-container {
    display: flex;
    gap: 10px;
    align-items: center;

    .captcha-input {
      flex: 1;
    }

    .captcha-image {
      width: 120px;
      height: 40px;
      cursor: pointer;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &:hover {
        border-color: #409eff;
      }
    }
  }

  .forgot-password {
    float: right;
    font-size: 14px;
  }

  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 4px;
  }
}

.login-footer {
  margin-top: 20px;
  text-align: center;

  .tips {
    margin: 0 0 10px;
    font-size: 12px;
    color: #999;
  }

  .version {
    font-size: 12px;
    color: #666;
  }
}

.login-footer-bottom {
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;

  p {
    margin: 0;
  }
}

.lang-select {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;

  .lang-trigger {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    color: #fff;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

@media (max-width: 768px) {
  .login-form {
    padding: 30px 20px;
  }

  .login-header {
    .logo {
      h1 {
        font-size: 24px;
      }
    }
  }
}
</style>