<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择图标"
    width="800px"
    append-to-body
  >
    <div class="icon-selector">
      <!-- 搜索框 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索图标..."
          clearable
          @input="filterIcons"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 图标分类 -->
      <div class="category-tabs">
        <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
          <el-tab-pane
            v-for="category in categories"
            :key="category.name"
            :label="category.label"
            :name="category.name"
          >
            <div class="icon-grid">
              <div
                v-for="icon in filteredIcons"
                :key="icon.name"
                class="icon-item"
                :class="{ selected: selectedIcon === icon.name }"
                @click="selectIcon(icon.name)"
              >
                <div class="icon-wrapper">
                  <el-icon :size="24">
                    <component :is="icon.component" />
                  </el-icon>
                </div>
                <div class="icon-name">{{ icon.name }}</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 预览区域 -->
      <div class="preview-area" v-if="selectedIcon">
        <div class="preview-title">当前选择</div>
        <div class="preview-content">
          <el-icon :size="48" class="preview-icon">
            <component :is="selectedIconComponent" />
          </el-icon>
          <div class="preview-info">
            <div class="icon-name">{{ selectedIcon }}</div>
            <div class="icon-code">
              <code>{{ selectedIconComponent }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
  modelIcon?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:selectedIcon', value: string): void
  (e: 'confirm', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  modelIcon: ''
})

const emit = defineEmits<Emits>()

// 图标数据
const allIcons = ref<Array<{ name: string; component: any; category: string }>>([])

// UI状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedIcon = ref(props.modelIcon || '')
const searchText = ref('')
const activeCategory = ref('all')

// 图标分类
const categories = ref([
  { name: 'all', label: '全部' },
  { name: 'operation', label: '操作' },
  { name: 'navigation', label: '导航' },
  { name: 'status', label: '状态' },
  { name: 'data', label: '数据' },
  { name: 'file', label: '文件' },
  { name: 'user', label: '用户' },
  { name: 'system', label: '系统' }
])

// 图标分类映射
const iconCategoryMap: Record<string, string[]> = {
  operation: ['Edit', 'Delete', 'Plus', 'Minus', 'Check', 'Close', 'Refresh', 'Search', 'ZoomIn', 'ZoomOut'],
  navigation: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Back', 'More', 'MoreFilled', 'DArrowLeft', 'DArrowRight'],
  status: ['SuccessFilled', 'WarningFilled', 'Warning', 'CircleCheck', 'CircleClose', 'CircleCheckFilled', 'CircleCloseFilled'],
  data: ['DataBoard', 'DataLine', 'PieChart', 'Histogram', 'TrendCharts', 'Management', 'SetUp'],
  file: ['Document', 'Folder', 'FolderOpened', 'Files', 'FolderAdd', 'FolderDelete', 'FolderChecked'],
  user: ['User', 'UserFilled', 'Avatar', 'SwitchButton', 'Lock', 'Unlock', 'Key', 'Notification'],
  system: ['Setting', 'Tools', 'HomeFilled', 'Monitor', 'Iphone', 'Location', 'LocationInformation']
}

// 初始化图标数据
const initIcons = () => {
  const icons: Array<{ name: string; component: any; category: string }> = []

  // 添加所有 Element Plus 图标
  for (const [iconName, iconComponent] of Object.entries(ElementPlusIconsVue)) {
    // 确定分类
    let category = 'other'
    for (const [catName, iconList] of Object.entries(iconCategoryMap)) {
      if (iconList.includes(iconName)) {
        category = catName
        break
      }
    }

    icons.push({
      name: iconName,
      component: iconComponent,
      category
    })
  }

  // 按字母排序
  icons.sort((a, b) => a.name.localeCompare(b.name))
  allIcons.value = icons
}

// 过滤后的图标
const filteredIcons = computed(() => {
  let icons = allIcons.value

  // 按分类过滤
  if (activeCategory.value !== 'all') {
    icons = icons.filter(icon => icon.category === activeCategory.value)
  }

  // 按搜索文本过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    icons = icons.filter(icon =>
      icon.name.toLowerCase().includes(search)
    )
  }

  return icons
})

// 选择的图标组件
const selectedIconComponent = computed(() => {
  const icon = allIcons.value.find(i => i.name === selectedIcon.value)
  return icon ? icon.component : null
})

// 选择图标
const selectIcon = (iconName: string) => {
  selectedIcon.value = iconName
}

// 切换分类
const handleCategoryChange = () => {
  searchText.value = ''
}

// 确认选择
const handleConfirm = () => {
  if (selectedIcon.value) {
    emit('update:selectedIcon', selectedIcon.value)
    emit('confirm', selectedIcon.value)
  }
  dialogVisible.value = false
}

// 监听外部图标变化
watch(() => props.modelIcon, (newValue) => {
  if (newValue) {
    selectedIcon.value = newValue
  }
})

// 初始化
onMounted(() => {
  initIcons()
})
</script>

<style lang="scss" scoped>
.icon-selector {
  .search-bar {
    margin-bottom: 20px;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 16px;
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid #e4e7ed;

      &:hover {
        background-color: #f5f7fa;
        border-color: #409EFF;
      }

      &.selected {
        background-color: rgba(64, 158, 255, 0.1);
        border-color: #409EFF;
      }

      .icon-wrapper {
        margin-bottom: 8px;
        color: #606266;
      }

      .icon-name {
        font-size: 12px;
        color: #909399;
        text-align: center;
        word-break: break-all;
      }
    }
  }

  .preview-area {
    margin-top: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;

    .preview-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
    }

    .preview-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .preview-icon {
        color: #409EFF;
      }

      .preview-info {
        .icon-name {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .icon-code {
          font-size: 12px;
          color: #909399;

          code {
            background-color: #fff;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }
        }
      }
    }
  }
}
</style>