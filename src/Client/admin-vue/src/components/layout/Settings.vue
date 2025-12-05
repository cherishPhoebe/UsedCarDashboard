<template>
  <el-drawer
    v-model="visible"
    title="系统设置"
    direction="rtl"
    size="300px"
    :before-close="handleClose"
  >
    <div class="settings-container">
      <!-- 主题设置 -->
      <div class="settings-group">
        <h3 class="settings-title">主题设置</h3>

        <div class="settings-item">
          <span class="settings-label">主题颜色</span>
          <div class="theme-colors">
            <div
              v-for="color in themeColors"
              :key="color"
              class="color-block"
              :style="{ backgroundColor: color }"
              @click="changeTheme(color)"
            >
              <el-icon v-if="settings.theme === color"><Check /></el-icon>
            </div>
          </div>
        </div>

        <div class="settings-item">
          <span class="settings-label">导航模式</span>
          <div class="layout-modes">
            <div
              v-for="mode in layoutModes"
              :key="mode.value"
              class="layout-mode"
              :class="{ active: settings.layout === mode.value }"
              @click="changeLayout(mode.value)"
            >
              <div class="mode-preview" :style="mode.style"></div>
              <span class="mode-name">{{ mode.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 界面显示 -->
      <div class="settings-group">
        <h3 class="settings-title">界面显示</h3>

        <div class="settings-item">
          <span class="settings-label">显示标签页</span>
          <el-switch v-model="settings.showTagsView" />
        </div>

        <div class="settings-item">
          <span class="settings-label">显示侧边栏Logo</span>
          <el-switch v-model="settings.showSidebarLogo" />
        </div>

        <div class="settings-item">
          <span class="settings-label">固定Header</span>
          <el-switch v-model="settings.fixedHeader" />
        </div>

        <div class="settings-item">
          <span class="settings-label">侧边栏主题</span>
          <el-select v-model="settings.sidebarTheme" size="small">
            <el-option label="深色主题" value="dark" />
            <el-option label="浅色主题" value="light" />
          </el-select>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="settings-group">
        <h3 class="settings-title">其他设置</h3>

        <div class="settings-item">
          <span class="settings-label">动画效果</span>
          <el-switch v-model="settings.enableAnimation" />
        </div>

        <div class="settings-item">
          <span class="settings-label">弱色模式</span>
          <el-switch v-model="settings.weakMode" @change="toggleWeakMode" />
        </div>

        <div class="settings-item">
          <span class="settings-label">灰色模式</span>
          <el-switch v-model="settings.grayMode" @change="toggleGrayMode" />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="settings-actions">
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">重置默认</el-button>
        <el-button @click="copySettings">复制配置</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/store/modules/settings'

const settingsStore = useSettingsStore()

const visible = computed({
  get: () => settingsStore.settingsVisible,
  set: (value) => settingsStore.setSettingsVisible(value)
})

const settings = computed(() => settingsStore.settings)

// 主题颜色
const themeColors = [
  '#409EFF',
  '#1890ff',
  '#304156',
  '#212121',
  '#11a983',
  '#13c2c2',
  '#6959CD',
  '#f5222d'
]

// 布局模式
const layoutModes = [
  {
    value: 'left',
    name: '左侧导航',
    style: {
      background: 'linear-gradient(90deg, #001529 60%, #fff 60%)'
    }
  },
  {
    value: 'top',
    name: '顶部导航',
    style: {
      background: 'linear-gradient(180deg, #001529 20%, #fff 20%)'
    }
  },
  {
    value: 'mix',
    name: '混合导航',
    style: {
      background: 'linear-gradient(90deg, #001529 20%, #fff 20%, #fff 80%, #f0f2f5 80%)'
    }
  }
]

// 关闭设置
const handleClose = () => {
  settingsStore.setSettingsVisible(false)
}

// 切换主题颜色
const changeTheme = (color: string) => {
  settingsStore.changeSetting({ key: 'theme', value: color })
}

// 切换布局模式
const changeLayout = (layout: string) => {
  settingsStore.changeSetting({ key: 'layout', value: layout })
}

// 切换弱色模式
const toggleWeakMode = (value: boolean) => {
  const html = document.documentElement
  if (value) {
    html.classList.add('weak-mode')
  } else {
    html.classList.remove('weak-mode')
  }
}

// 切换灰色模式
const toggleGrayMode = (value: boolean) => {
  const html = document.documentElement
  if (value) {
    html.classList.add('gray-mode')
  } else {
    html.classList.remove('gray-mode')
  }
}

// 保存设置
const saveSettings = () => {
  settingsStore.saveSettings()
  ElMessage.success('设置保存成功')
  handleClose()
}

// 重置设置
const resetSettings = () => {
  settingsStore.resetSettings()
  ElMessage.success('设置已重置为默认值')
}

// 复制配置
const copySettings = async () => {
  try {
    const settingsStr = JSON.stringify(settings.value, null, 2)
    await navigator.clipboard.writeText(settingsStr)
    ElMessage.success('配置已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 0 20px 20px;

  .settings-group {
    margin-bottom: 24px;

    .settings-title {
      margin: 0 0 16px;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 8px;
    }

    .settings-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .settings-label {
        font-size: 14px;
        color: #666;
      }

      .theme-colors {
        display: flex;
        gap: 8px;

        .color-block {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
          transition: all 0.3s;

          &:hover {
            transform: scale(1.1);
          }

          .el-icon {
            color: white;
            font-size: 12px;
          }

          &.active {
            border-color: #409EFF;
          }
        }
      }

      .layout-modes {
        display: flex;
        gap: 16px;

        .layout-mode {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          .mode-preview {
            width: 60px;
            height: 50px;
            border-radius: 4px;
            border: 2px solid #dcdfe6;
            transition: all 0.3s;
          }

          .mode-name {
            font-size: 12px;
            color: #666;
          }

          &.active {
            .mode-preview {
              border-color: #409EFF;
            }

            .mode-name {
              color: #409EFF;
              font-weight: 500;
            }
          }

          &:hover {
            .mode-preview {
              border-color: #409EFF;
            }
          }
        }
      }
    }
  }

  .settings-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;

    .el-button {
      flex: 1;
    }
  }
}
</style>