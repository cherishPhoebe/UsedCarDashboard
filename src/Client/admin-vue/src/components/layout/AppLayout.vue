<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <Sidebar v-if="!isMobile || sidebar.opened" />

    <!-- 主容器 -->
    <div class="main-container" :class="{ 'has-tags-view': settings.showTagsView }">
      <!-- 头部 -->
      <Header />

      <!-- 标签页 -->
      <TagsView v-if="settings.showTagsView" />

      <!-- 内容区域 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="key" />
            </keep-alive>
          </transition>
        </router-view>
      </div>

      <!-- 底部 -->
      <Footer />
    </div>

    <!-- 设置面板 -->
    <Settings />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TagsView from './TagsView.vue'
import Footer from './Footer.vue'
import Settings from './Settings.vue'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const key = computed(() => route.path)
const sidebar = computed(() => appStore.sidebar)
const isMobile = computed(() => appStore.isMobile)
const settings = computed(() => settingsStore.settings)
const cachedViews = computed(() => appStore.cachedViews)
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;

  &::after {
    display: table;
    clear: both;
    content: '';
  }
}

.main-container {
  min-height: 100%;
  transition: margin-left 0.28s;
  margin-left: var(--sidebar-width);
  position: relative;

  &.has-tags-view {
    .app-main {
      height: calc(100% - var(--header-height) - var(--tags-view-height));
    }
  }

  &:not(.has-tags-view) {
    .app-main {
      height: calc(100% - var(--header-height));
    }
  }
}

.app-main {
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f0f2f5;

  .fixed-header + & {
    padding-top: var(--header-height);
  }
}
</style>