import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

interface SettingsState {
  settingsVisible: boolean
  settings: {
    theme: string
    layout: string
    showTagsView: boolean
    showSidebarLogo: boolean
    showBreadcrumb: boolean
    showWatermark: boolean
    fixedHeader: boolean
    sidebarTheme: string
    enableAnimation: boolean
    weakMode: boolean
    grayMode: boolean
  }
}

const defaultSettings: SettingsState['settings'] = {
  theme: '#409EFF',
  layout: 'left',
  showTagsView: true,
  showSidebarLogo: true,
  showBreadcrumb: true,
  showWatermark: true,
  fixedHeader: true,
  sidebarTheme: 'dark',
  enableAnimation: true,
  weakMode: false,
  grayMode: false
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settingsVisible: false,
    settings: storage.get('app-settings') || defaultSettings
  }),

  actions: {
    // 打开设置面板
    openSettings() {
      this.settingsVisible = true
    },

    // 关闭设置面板
    closeSettings() {
      this.settingsVisible = false
    },

    // 设置面板可见性
    setSettingsVisible(visible: boolean) {
      this.settingsVisible = visible
    },

    // 修改设置
    changeSetting({ key, value }: { key: keyof SettingsState['settings']; value: any }) {
      if (this.settings.hasOwnProperty(key)) {
        ; (this.settings[key] as any) = value
      }
    },

    // 保存设置
    saveSettings() {
      storage.set('app-settings', this.settings)
    },

    // 重置设置
    resetSettings() {
      this.settings = { ...defaultSettings }
      storage.remove('app-settings')

      // 移除特殊模式
      const html = document.documentElement
      html.classList.remove('weak-mode')
      html.classList.remove('gray-mode')
    },

    // 初始化配置
    initSettings() {
      this.settings = { ...defaultSettings }
    }
  }
})