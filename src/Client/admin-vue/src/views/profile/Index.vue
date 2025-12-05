<template>
  <div class="profile-container">
    <!-- 用户信息卡片 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover" class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <el-avatar :size="100" :src="userInfo.avatar" />
                <div class="avatar-actions">
                  <el-upload
                    action="/api/upload/avatar"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                  >
                    <el-button type="text" size="small">更换头像</el-button>
                  </el-upload>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="user-basic">
                <h2 class="username">{{ userInfo.username }}</h2>
                <p class="email">{{ userInfo.email }}</p>
                <div class="user-tags">
                  <el-tag type="success" size="small">已验证邮箱</el-tag>
                  <el-tag type="info" size="small" v-if="userInfo.phone">已验证手机</el-tag>
                  <el-tag type="warning" size="small">VIP用户</el-tag>
                </div>
              </div>

              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-label">注册时间</span>
                  <span class="stat-value">{{ formatDate(userInfo.createdAt) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最后登录</span>
                  <span class="stat-value">{{ formatDate(lastLoginTime) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">登录次数</span>
                  <span class="stat-value">{{ loginCount }}</span>
                </div>
              </div>
            </div>

            <div class="action-section">
              <el-button type="primary" @click="editProfile">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细信息 -->
    <el-row :gutter="20" class="detail-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">基本信息</span>
              <el-button type="text" @click="editProfile">编辑</el-button>
            </div>
          </template>

          <el-form label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名">
                  <el-input v-model="userInfo.username" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="userInfo.email" disabled>
                    <template #append>
                      <el-button type="text" @click="verifyEmail">验证</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="userInfo.phone" disabled>
                    <template #append>
                      <el-button type="text" @click="verifyPhone">验证</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-select v-model="userInfo.gender" disabled>
                    <el-option label="男" value="male" />
                    <el-option label="女" value="female" />
                    <el-option label="保密" value="secret" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="所属部门">
              <el-input v-model="userInfo.department" disabled />
            </el-form-item>

            <el-form-item label="个人简介">
              <el-input
                v-model="userInfo.bio"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                disabled
              />
            </el-form-item>

            <el-form-item label="地址">
              <el-input v-model="userInfo.address" disabled />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 角色权限 -->
        <el-card shadow="hover" class="role-card">
          <template #header>
            <span class="card-title">角色权限</span>
          </template>

          <div class="role-list">
            <div class="role-item" v-for="role in userInfo.roles" :key="role.id">
              <div class="role-info">
                <h4>{{ role.name }}</h4>
                <p>{{ role.description }}</p>
              </div>
              <div class="role-actions">
                <el-tag :type="role.isSystem ? 'danger' : 'primary'" size="small">
                  {{ role.isSystem ? '系统角色' : '普通角色' }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="permission-summary">
            <el-statistic title="拥有权限" :value="permissionCount" />
            <div class="view-permissions">
              <el-button type="text" @click="viewAllPermissions">
                查看全部权限
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 安全设置 -->
        <el-card shadow="hover" class="security-card">
          <template #header>
            <span class="card-title">安全设置</span>
          </template>

          <div class="security-items">
            <div class="security-item" @click="changePassword">
              <div class="security-icon">
                <el-icon><Lock /></el-icon>
              </div>
              <div class="security-content">
                <h4>修改密码</h4>
                <p>定期修改密码更安全</p>
              </div>
              <div class="security-action">
                <el-icon><Right /></el-icon>
              </div>
            </div>

            <div class="security-item" @click="setupTwoFactor">
              <div class="security-icon">
                <el-icon><Key /></el-icon>
              </div>
              <div class="security-content">
                <h4>双重验证</h4>
                <p>{{ twoFactorEnabled ? '已开启' : '未开启' }}</p>
              </div>
              <div class="security-action">
                <el-tag :type="twoFactorEnabled ? 'success' : 'info'" size="small">
                  {{ twoFactorEnabled ? '已开启' : '未开启' }}
                </el-tag>
              </div>
            </div>

            <div class="security-item" @click="manageDevices">
              <div class="security-icon">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="security-content">
                <h4>登录设备</h4>
                <p>{{ deviceCount }} 台设备</p>
              </div>
              <div class="security-action">
                <el-icon><Right /></el-icon>
              </div>
            </div>

            <div class="security-item" @click="viewLoginLogs">
              <div class="security-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="security-content">
                <h4>登录日志</h4>
                <p>查看登录历史记录</p>
              </div>
              <div class="security-action">
                <el-icon><Right /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账户状态 -->
    <el-row :gutter="20" class="status-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">账户状态</span>
          </template>

          <div class="account-status">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="status-item">
                  <div class="status-icon status-active">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="status-content">
                    <h4>账户状态</h4>
                    <p>{{ userInfo.status ? '正常' : '禁用' }}</p>
                  </div>
                </div>
              </el-col>

              <el-col :span="6">
                <div class="status-item">
                  <div class="status-icon status-verified">
                    <el-icon><Check /></el-icon>
                  </div>
                  <div class="status-content">
                    <h4>邮箱验证</h4>
                    <p>{{ emailVerified ? '已验证' : '未验证' }}</p>
                  </div>
                </div>
              </el-col>

              <el-col :span="6">
                <div class="status-item">
                  <div class="status-icon status-warning">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="status-content">
                    <h4>账户安全</h4>
                    <p>{{ securityScore }}/100</p>
                  </div>
                </div>
              </el-col>

              <el-col :span="6">
                <div class="status-item">
                  <div class="status-icon status-info">
                    <el-icon><DataLine /></el-icon>
                  </div>
                  <div class="status-content">
                    <h4>账户等级</h4>
                    <p>{{ userLevel }}</p>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-row :gutter="20" class="activity-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近活动</span>
              <el-button type="text" @click="viewAllActivities">查看全部</el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="formatTime(activity.time)"
              :type="activity.type"
              placement="top"
            >
              <div class="activity-item">
                <div class="activity-icon">
                  <el-icon :size="20">
                    <component :is="activity.icon" />
                  </el-icon>
                </div>
                <div class="activity-content">
                  <h4>{{ activity.title }}</h4>
                  <p>{{ activity.description }}</p>
                </div>
                <div class="activity-meta">
                  <el-tag :type="activity.statusType" size="small">
                    {{ activity.status }}
                  </el-tag>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Edit,
  Lock,
  Key,
  Monitor,
  Clock,
  User,
  Check,
  Warning,
  DataLine,
  Right
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { formatDate, formatTime } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()

// 用户信息（从store获取并本地化）
const userInfo = reactive({
  ...authStore.userInfo!,
  phone: '13800138000',
  gender: 'male',
  department: '技术部',
  bio: '专注于系统架构设计和权限管理，热爱技术，追求卓越。',
  address: '北京市海淀区中关村软件园'
})

// 状态数据
const lastLoginTime = ref(new Date().toISOString())
const loginCount = ref(156)
const permissionCount = computed(() => {
  return userInfo.roles?.reduce((total, role) => total + (role.permissions?.length || 0), 0) || 0
})
const twoFactorEnabled = ref(false)
const deviceCount = ref(3)
const emailVerified = ref(true)
const securityScore = ref(85)
const userLevel = ref('VIP 3')

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '修改密码',
    description: '成功修改登录密码',
    time: new Date().toISOString(),
    type: 'success',
    icon: Lock,
    status: '成功',
    statusType: 'success'
  },
  {
    id: 2,
    title: '登录系统',
    description: '从新设备登录',
    time: new Date(Date.now() - 3600000).toISOString(),
    type: 'primary',
    icon: User,
    status: '成功',
    statusType: 'success'
  },
  {
    id: 3,
    title: '权限变更',
    description: '角色权限配置更新',
    time: new Date(Date.now() - 7200000).toISOString(),
    type: 'warning',
    icon: Key,
    status: '已应用',
    statusType: 'warning'
  },
  {
    id: 4,
    title: '个人信息',
    description: '更新个人资料',
    time: new Date(Date.now() - 86400000).toISOString(),
    type: 'info',
    icon: Edit,
    status: '已保存',
    statusType: 'info'
  }
])

// 编辑资料
const editProfile = () => {
  // 这里可以打开编辑资料的弹窗
  router.push('/profile/edit')
}

// 验证邮箱
const verifyEmail = () => {
  ElMessage.info('验证邮件已发送到您的邮箱，请查收')
}

// 验证手机
const verifyPhone = () => {
  ElMessage.info('验证码已发送到您的手机，请查收')
}

// 查看所有权限
const viewAllPermissions = () => {
  router.push('/system/permission')
}

// 修改密码
const changePassword = () => {
  router.push('/profile/change-password')
}

// 设置双重验证
const setupTwoFactor = () => {
  ElMessage.info('双重验证设置功能正在开发中')
}

// 管理设备
const manageDevices = () => {
  router.push('/profile/devices')
}

// 查看登录日志
const viewLoginLogs = () => {
  router.push('/profile/login-logs')
}

// 查看所有活动
const viewAllActivities = () => {
  router.push('/profile/activities')
}

// 头像上传成功
const handleAvatarSuccess = (response: any) => {
  userInfo.avatar = response.data.url
  ElMessage.success('头像更新成功')
}

// 头像上传前检查
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }

  return isImage && isLt2M
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;

  .profile-card {
    margin-bottom: 20px;

    .profile-header {
      display: flex;
      align-items: center;
      gap: 30px;

      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: 20px;
      }

      .avatar-section {
        flex-shrink: 0;

        .avatar-wrapper {
          position: relative;

          .avatar-actions {
            margin-top: 10px;
            text-align: center;
          }
        }
      }

      .info-section {
        flex: 1;

        .user-basic {
          margin-bottom: 20px;

          .username {
            margin: 0 0 8px;
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }

          .email {
            margin: 0 0 12px;
            color: #666;
            font-size: 14px;
          }

          .user-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
        }

        .user-stats {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;

          .stat-item {
            display: flex;
            flex-direction: column;

            .stat-label {
              font-size: 12px;
              color: #999;
              margin-bottom: 4px;
            }

            .stat-value {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }

      .action-section {
        flex-shrink: 0;
      }
    }
  }

  .detail-row {
    margin-bottom: 20px;

    .role-card {
      margin-bottom: 20px;

      .role-list {
        .role-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .role-info {
            flex: 1;

            h4 {
              margin: 0 0 4px;
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

      .permission-summary {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
        text-align: center;

        :deep(.el-statistic) {
          .el-statistic__number {
            font-size: 36px;
            color: #409EFF;
          }
        }

        .view-permissions {
          margin-top: 10px;
        }
      }
    }

    .security-card {
      .security-items {
        .security-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background-color: #f5f7fa;
            padding-left: 8px;
            padding-right: 8px;
            border-radius: 4px;
          }

          .security-icon {
            width: 32px;
            height: 32px;
            background-color: #409EFF;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;

            .el-icon {
              color: white;
              font-size: 16px;
            }
          }

          .security-content {
            flex: 1;

            h4 {
              margin: 0 0 4px;
              font-size: 14px;
              color: #333;
            }

            p {
              margin: 0;
              font-size: 12px;
              color: #999;
            }
          }

          .security-action {
            .el-icon {
              color: #999;
            }
          }
        }
      }
    }
  }

  .status-row {
    margin-bottom: 20px;

    .account-status {
      .status-item {
        display: flex;
        align-items: center;
        gap: 15px;

        .status-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.status-active {
            background-color: rgba(64, 158, 255, 0.1);

            .el-icon {
              color: #409EFF;
            }
          }

          &.status-verified {
            background-color: rgba(103, 194, 58, 0.1);

            .el-icon {
              color: #67C23A;
            }
          }

          &.status-warning {
            background-color: rgba(230, 162, 60, 0.1);

            .el-icon {
              color: #E6A23C;
            }
          }

          &.status-info {
            background-color: rgba(144, 147, 153, 0.1);

            .el-icon {
              color: #909399;
            }
          }

          .el-icon {
            font-size: 24px;
          }
        }

        .status-content {
          h4 {
            margin: 0 0 4px;
            font-size: 14px;
            color: #666;
          }

          p {
            margin: 0;
            font-size: 16px;
            color: #333;
            font-weight: 600;
          }
        }
      }
    }
  }

  .activity-row {
    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .activity-icon {
        width: 32px;
        height: 32px;
        background-color: #f5f7fa;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .activity-content {
        flex: 1;

        h4 {
          margin: 0 0 4px;
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
</style>