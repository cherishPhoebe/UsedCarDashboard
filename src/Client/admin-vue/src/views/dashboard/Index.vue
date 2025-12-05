<template>
  <div class="dashboard-container">
    <!-- 欢迎区域 -->
    <el-row :gutter="20" class="welcome-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="welcome-content">
            <div class="welcome-text">
              <h2>欢迎回来，{{ userInfo?.username || '用户' }}！</h2>
              <p class="subtitle">
                {{ greeting }}，今天是 {{ currentDate }}，祝您工作愉快！
              </p>
              <div class="stats">
                <div class="stat-item">
                  <span class="stat-label">在线人数</span>
                  <span class="stat-value">{{ dashboardStats.onlineUsers }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">系统用户</span>
                  <span class="stat-value">{{ dashboardStats.totalUsers }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">角色数量</span>
                  <span class="stat-value">{{ dashboardStats.totalRoles }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">权限数量</span>
                  <span class="stat-value">{{ dashboardStats.totalPermissions }}</span>
                </div>
              </div>
            </div>
            <div class="welcome-illustration">
              <img src="@/assets/images/dashboard.svg" alt="仪表盘" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-actions-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="action in quickActions" :key="action.title">
        <el-card shadow="hover" class="quick-action-card" @click="handleQuickAction(action.action)">
          <div class="action-content">
            <div class="action-icon" :style="{ backgroundColor: action.color }">
              <el-icon :size="24">
                <component :is="action.icon" />
              </el-icon>
            </div>
            <div class="action-info">
              <h4>{{ action.title }}</h4>
              <p>{{ action.description }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">用户活跃统计</span>
              <el-select v-model="activeDays" size="small" class="date-select">
                <el-option label="最近7天" :value="7" />
                <el-option label="最近30天" :value="30" />
                <el-option label="最近90天" :value="90" />
              </el-select>
            </div>
          </template>
          <div ref="userActivityChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">角色分布统计</span>
            </div>
          </template>
          <div ref="roleDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近操作记录 -->
    <el-row :gutter="20" class="recent-actions-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近操作记录</span>
              <el-button type="text" @click="viewAllLogs">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentLogs" style="width: 100%" v-loading="loading">
            <el-table-column prop="user" label="操作用户" width="120" />
            <el-table-column prop="action" label="操作类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getActionType(row.action)">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="操作描述" />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="time" label="操作时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="viewLogDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-row :gutter="20" class="system-info-row">
      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="card-title">系统信息</span>
          </template>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">系统版本:</span>
              <span class="info-value">{{ systemInfo.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">前端版本:</span>
              <span class="info-value">V{{ appVersion }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后更新:</span>
              <span class="info-value">{{ systemInfo.lastUpdate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">运行时间:</span>
              <span class="info-value">{{ systemInfo.uptime }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="card-title">服务器状态</span>
          </template>
          <div class="server-stats">
            <div class="server-stat">
              <div class="stat-header">
                <span>CPU使用率</span>
                <span>{{ serverStats.cpuUsage }}%</span>
              </div>
              <el-progress :percentage="serverStats.cpuUsage" :color="getProgressColor(serverStats.cpuUsage)" />
            </div>
            <div class="server-stat">
              <div class="stat-header">
                <span>内存使用率</span>
                <span>{{ serverStats.memoryUsage }}%</span>
              </div>
              <el-progress :percentage="serverStats.memoryUsage" :color="getProgressColor(serverStats.memoryUsage)" />
            </div>
            <div class="server-stat">
              <div class="stat-header">
                <span>磁盘使用率</span>
                <span>{{ serverStats.diskUsage }}%</span>
              </div>
              <el-progress :percentage="serverStats.diskUsage" :color="getProgressColor(serverStats.diskUsage)" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <span class="card-title">快捷链接</span>
          </template>
          <div class="quick-links">
            <el-button
              v-for="link in quickLinks"
              :key="link.title"
              :type="link.type"
              :icon="link.icon"
              class="quick-link-btn"
              @click="handleQuickLink(link.action)"
            >
              {{ link.title }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { User, Plus, Edit, Setting, Help, ChartLine, Document, Bell, Link } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECOption } from '@/types/echarts'
import { formatTime } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()

const userInfo = computed(() => authStore.userInfo)
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

// 图表引用
const userActivityChart = ref<HTMLElement>()
const roleDistributionChart = ref<HTMLElement>()

// 数据状态
const loading = ref(false)
const activeDays = ref(7)

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 星期${weekDay}`
})

// 仪表盘统计数据
const dashboardStats = reactive({
  onlineUsers: 125,
  totalUsers: 856,
  totalRoles: 24,
  totalPermissions: 156
})

// 快捷操作
const quickActions = [
  {
    title: '新建用户',
    description: '快速创建新用户账户',
    icon: User,
    color: '#409EFF',
    action: 'createUser'
  },
  {
    title: '角色管理',
    description: '管理系统角色和权限',
    icon: Setting,
    color: '#67C23A',
    action: 'manageRoles'
  },
  {
    title: '权限配置',
    description: '配置系统访问权限',
    icon: Edit,
    color: '#E6A23C',
    action: 'configPermissions'
  },
  {
    title: '生成报表',
    description: '导出系统使用数据',
    icon: ChartLine,
    color: '#F56C6C',
    action: 'generateReport'
  }
]

// 最近操作记录
const recentLogs = ref([
  {
    id: 1,
    user: 'admin',
    action: '登录',
    description: '用户登录系统',
    ip: '192.168.1.100',
    time: new Date().toISOString()
  },
  {
    id: 2,
    user: '张三',
    action: '创建',
    description: '创建新用户：李四',
    ip: '192.168.1.101',
    time: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    user: '李四',
    action: '修改',
    description: '修改角色权限设置',
    ip: '192.168.1.102',
    time: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    user: '王五',
    action: '删除',
    description: '删除无效用户账户',
    ip: '192.168.1.103',
    time: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 5,
    user: 'admin',
    action: '导出',
    description: '导出用户数据报表',
    ip: '192.168.1.100',
    time: new Date(Date.now() - 14400000).toISOString()
  }
])

// 系统信息
const systemInfo = reactive({
  version: 'RBAC v2.0.0',
  lastUpdate: '2024-01-15',
  uptime: '15天8小时32分'
})

// 服务器状态
const serverStats = reactive({
  cpuUsage: 45,
  memoryUsage: 68,
  diskUsage: 32
})

// 快捷链接
const quickLinks = [
  {
    title: '用户手册',
    icon: Document,
    type: 'primary',
    action: 'openManual'
  },
  {
    title: '系统设置',
    icon: Setting,
    type: 'success',
    action: 'openSettings'
  },
  {
    title: '通知中心',
    icon: Bell,
    type: 'warning',
    action: 'openNotifications'
  },
  {
    title: '帮助中心',
    icon: Help,
    type: 'info',
    action: 'openHelp'
  },
  {
    title: '外部链接',
    icon: Link,
    type: 'default',
    action: 'openExternalLinks'
  }
]

// 图表实例
let userActivityChartInstance: echarts.ECharts | null = null
let roleDistributionChartInstance: echarts.ECharts | null = null

// 初始化图表
const initCharts = () => {
  if (userActivityChart.value) {
    userActivityChartInstance = echarts.init(userActivityChart.value)

    const option: ECOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: {
          lineStyle: {
            color: '#dcdfe6'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#dcdfe6'
          }
        }
      },
      series: [
        {
          name: '活跃用户',
          type: 'bar',
          data: [120, 200, 150, 80, 70, 110, 130],
          itemStyle: {
            color: '#409EFF'
          }
        },
        {
          name: '新增用户',
          type: 'line',
          data: [20, 32, 18, 15, 12, 25, 22],
          smooth: true,
          lineStyle: {
            color: '#67C23A'
          },
          itemStyle: {
            color: '#67C23A'
          }
        }
      ]
    }

    userActivityChartInstance.setOption(option)
  }

  if (roleDistributionChart.value) {
    roleDistributionChartInstance = echarts.init(roleDistributionChart.value)

    const option: ECOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [
        {
          name: '角色分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 335, name: '管理员' },
            { value: 310, name: '普通用户' },
            { value: 234, name: '访客' },
            { value: 135, name: '审计员' },
            { value: 154, name: '操作员' }
          ],
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
        }
      ]
    }

    roleDistributionChartInstance.setOption(option)
  }
}

// 处理快捷操作
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'createUser':
      router.push('/system/user?action=create')
      break
    case 'manageRoles':
      router.push('/system/role')
      break
    case 'configPermissions':
      router.push('/system/permission')
      break
    case 'generateReport':
      generateReport()
      break
  }
}

// 生成报表
const generateReport = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('报表生成成功，已开始下载')
  }, 1500)
}

// 查看所有日志
const viewAllLogs = () => {
  router.push('/system/log')
}

// 查看日志详情
const viewLogDetail = (log: any) => {
  console.log('查看日志详情:', log)
  // 这里可以打开详情弹窗或跳转到详情页
}

// 获取操作类型
const getActionType = (action: string) => {
  const actionTypes: Record<string, string> = {
    '登录': 'success',
    '创建': 'primary',
    '修改': 'warning',
    '删除': 'danger',
    '导出': 'info'
  }
  return actionTypes[action] || 'default'
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 60) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

// 处理快捷链接
const handleQuickLink = (action: string) => {
  switch (action) {
    case 'openManual':
      window.open('/docs/manual.pdf', '_blank')
      break
    case 'openSettings':
      router.push('/system/settings')
      break
    case 'openNotifications':
      router.push('/notifications')
      break
    case 'openHelp':
      window.open('/help', '_blank')
      break
    case 'openExternalLinks':
      console.log('打开外部链接管理')
      break
  }
}

// 窗口大小改变时重置图表
const handleResize = () => {
  userActivityChartInstance?.resize()
  roleDistributionChartInstance?.resize()
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initCharts()
  })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  userActivityChartInstance?.dispose()
  roleDistributionChartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .welcome-row {
    margin-bottom: 20px;

    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
      }

      .welcome-text {
        flex: 1;

        h2 {
          margin: 0 0 10px;
          font-size: 24px;
          color: #333;
        }

        .subtitle {
          margin: 0 0 20px;
          font-size: 16px;
          color: #666;
        }

        .stats {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .stat-label {
              font-size: 14px;
              color: #999;
              margin-bottom: 5px;
            }

            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #409EFF;
            }
          }
        }
      }

      .welcome-illustration {
        width: 200px;
        height: 150px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          margin-top: 20px;
        }
      }
    }
  }

  .quick-actions-row {
    margin-bottom: 20px;

    .quick-action-card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
      }

      .action-content {
        display: flex;
        align-items: center;
        gap: 15px;

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .action-info {
          flex: 1;

          h4 {
            margin: 0 0 5px;
            font-size: 16px;
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

  .stats-row {
    margin-bottom: 20px;

    .chart-card {
      height: 400px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: bold;
        }

        .date-select {
          width: 120px;
        }
      }

      .chart-container {
        width: 100%;
        height: 320px;
      }
    }
  }

  .recent-actions-row {
    margin-bottom: 20px;
  }

  .system-info-row {
    .info-card {
      height: 100%;

      .card-title {
        font-size: 16px;
        font-weight: bold;
      }

      .info-list {
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            color: #666;
          }

          .info-value {
            color: #333;
            font-weight: 500;
          }
        }
      }

      .server-stats {
        .server-stat {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .stat-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;

            span:first-child {
              color: #666;
            }

            span:last-child {
              color: #333;
              font-weight: 500;
            }
          }
        }
      }

      .quick-links {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .quick-link-btn {
          width: 100%;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>