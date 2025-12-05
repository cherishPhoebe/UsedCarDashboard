<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-view-wrapper" ref="scrollbarRef" @wheel.passive="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        class="tags-view-item"
        :class="{ active: isActive(tag) }"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <el-icon
          v-if="!isAffix(tag)"
          class="close-icon"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </el-scrollbar>

    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        <el-icon><Refresh /></el-icon>刷新
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <el-icon><Close /></el-icon>关闭
      </li>
      <li @click="closeOthersTags">
        <el-icon><CircleClose /></el-icon>关闭其他
      </li>
      <li @click="closeAllTags(selectedTag)">
        <el-icon><FolderDelete /></el-icon>关闭所有
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeRightTags">
        <el-icon><Right /></el-icon>关闭右侧
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeLeftTags">
        <el-icon><Back /></el-icon>关闭左侧
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, Refresh, CircleClose, FolderDelete, Right, Back } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'
import path from 'path'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const scrollbarRef = ref()
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref<any>({})

// 访问过的视图
const visitedViews = computed(() => appStore.visitedViews)

// 是否激活
const isActive = (tag: any) => {
  return tag.path === route.path
}

// 是否是固定标签
const isAffix = (tag: any) => {
  return tag.meta?.affix === true
}

// 添加固定标签
const addAffixTags = () => {
  const affixTags = appStore.visitedViews.filter(tag => isAffix(tag))
  for (const tag of affixTags) {
    if (tag.name) {
      appStore.addVisitedView(tag)
    }
  }
}

// 移动滚动条到当前标签
const moveToCurrentTag = () => {
  nextTick(() => {
    const tags = document.querySelectorAll('.tags-view-item')
    for (const tag of tags) {
      if ((tag as HTMLElement).classList.contains('active')) {
        ;(scrollbarRef.value as any).wrap$.scrollLeft = (tag as HTMLElement).offsetLeft
        break
      }
    }
  })
}

// 关闭选中的标签
const closeSelectedTag = (view: any) => {
  appStore.delVisitedView(view).then((visitedViews: any[]) => {
    if (isActive(view)) {
      toLastView(visitedViews)
    }
  })
}

// 刷新选中的标签
const refreshSelectedTag = (view: any) => {
  appStore.delCachedView(view)
  const { fullPath } = view
  nextTick(() => {
    router.replace({
      path: '/redirect' + fullPath
    })
  })
}

// 关闭其他标签
const closeOthersTags = () => {
  router.push(selectedTag.value)
  appStore.delOthersVisitedViews(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

// 关闭所有标签
const closeAllTags = (view: any) => {
  appStore.delAllVisitedViews().then((visitedViews: any[]) => {
    if (visitedViews.some(v => v.path === view.path)) {
      return
    }
    toLastView(visitedViews)
  })
}

// 关闭右侧标签
const closeRightTags = () => {
  appStore.delRightVisitedViews(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

// 关闭左侧标签
const closeLeftTags = () => {
  appStore.delLeftVisitedViews(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

// 跳转到最后一个视图
const toLastView = (visitedViews: any[]) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    router.push('/')
  }
}

// 打开右键菜单
const openMenu = (tag: any, e: MouseEvent) => {
  const menuMinWidth = 105
  const offsetLeft = (scrollbarRef.value as any).$el.getBoundingClientRect().left
  const offsetWidth = (scrollbarRef.value as any).$el.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth
  const l = e.clientX - offsetLeft + 15

  if (l > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = l
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

// 关闭右键菜单
const closeMenu = () => {
  visible.value = false
}

// 处理滚动
const handleScroll = (e: WheelEvent) => {
  const eventDelta = e.deltaY || -e.detail
  const $scrollWrapper = (scrollbarRef.value as any).wrap$
  $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    addAffixTags()
    moveToCurrentTag()
  }
)

// 监听右键菜单
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

// 初始化
onMounted(() => {
  addAffixTags()
  moveToCurrentTag()
})
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: var(--tags-view-height);
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

  .tags-view-wrapper {
    height: 100%;
    white-space: nowrap;

    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      border-radius: 3px;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &.active {
        background-color: #409EFF;
        color: #fff;
        border-color: #409EFF;

        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }

      .close-icon {
        width: 16px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-origin: 100% 50%;

        &:hover {
          background-color: #b4bccc;
          color: #fff;
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;

      &:hover {
        background: #eee;
      }

      .el-icon {
        margin-right: 5px;
      }
    }
  }
}
</style>