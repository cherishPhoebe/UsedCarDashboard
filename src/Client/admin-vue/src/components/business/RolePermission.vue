<template>
  <div class="role-permission-container">
    <!-- 角色选择器 -->
    <div class="role-selector" v-if="showRoleSelector">
      <el-form :model="form" inline>
        <el-form-item label="选择角色" prop="roleId">
          <el-select
            v-model="form.roleId"
            placeholder="请选择角色"
            clearable
            filterable
            @change="handleRoleChange"
            style="width: 300px"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
              :disabled="role.isSystem"
            >
              <div class="role-option">
                <span>{{ role.name }}</span>
                <el-tag v-if="role.isSystem" type="danger" size="small">系统</el-tag>
                <span class="role-desc">{{ role.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadRolePermissions" :loading="loading">
            加载权限
          </el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 权限配置区域 -->
    <div class="permission-config" v-if="currentRole">
      <!-- 角色信息 -->
      <div class="role-info">
        <div class="role-header">
          <h3 class="role-name">
            {{ currentRole.name }}
            <el-tag v-if="currentRole.isSystem" type="danger" size="small">系统角色</el-tag>
          </h3>
          <div class="role-actions">
            <el-button type="primary" @click="savePermissions" :loading="saving">
              保存权限
            </el-button>
            <el-button @click="copyPermissions">复制权限</el-button>
            <el-button @click="exportPermissions">导出配置</el-button>
          </div>
        </div>
        <p class="role-description">{{ currentRole.description }}</p>
      </div>

      <!-- 权限标签页 -->
      <div class="permission-tabs">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 菜单权限 -->
          <el-tab-pane label="菜单权限" name="menu">
            <PermissionTree
              ref="menuTreeRef"
              :data="menuPermissions"
              :value="selectedMenuIds"
              :height="400"
              :show-operations="false"
              @change="handleMenuChange"
            />
          </el-tab-pane>

          <!-- 按钮权限 -->
          <el-tab-pane label="按钮权限" name="button">
            <PermissionTree
              ref="buttonTreeRef"
              :data="buttonPermissions"
              :value="selectedButtonIds"
              :height="400"
              :show-operations="false"
              @change="handleButtonChange"
            />
          </el-tab-pane>

          <!-- 接口权限 -->
          <el-tab-pane label="接口权限" name="api">
            <PermissionTree
              ref="apiTreeRef"
              :data="apiPermissions"
              :value="selectedApiIds"
              :height="400"
              :show-operations="false"
              @change="handleApiChange"
            />
          </el-tab-pane>

          <!-- 权限预览 -->
          <el-tab-pane label="权限预览" name="preview">
            <div class="permission-preview">
              <div class="preview-header">
                <h4>已选权限预览</h4>
                <el-button type="text" @click="clearAll">清空全部</el-button>
              </div>

              <div class="preview-content">
                <!-- 菜单权限 -->
                <div class="preview-section">
                  <div class="section-header">
                    <h5>菜单权限 ({{ selectedMenuCount }})</h5>
                    <el-button type="text" size="small" @click="clearMenu">清空</el-button>
                  </div>
                  <div class="section-content">
                    <el-tag
                      v-for="permission in selectedMenuPermissions"
                      :key="permission.id"
                      class="preview-tag"
                      closable
                      @close="removePermission(permission.id, 'menu')"
                    >
                      {{ permission.name }}
                    </el-tag>
                    <div v-if="selectedMenuCount === 0" class="empty-tip">
                      未选择任何菜单权限
                    </div>
                  </div>
                </div>

                <!-- 按钮权限 -->
                <div class="preview-section">
                  <div class="section-header">
                    <h5>按钮权限 ({{ selectedButtonCount }})</h5>
                    <el-button type="text" size="small" @click="clearButton">清空</el-button>
                  </div>
                  <div class="section-content">
                    <el-tag
                      v-for="permission in selectedButtonPermissions"
                      :key="permission.id"
                      type="warning"
                      class="preview-tag"
                      closable
                      @close="removePermission(permission.id, 'button')"
                    >
                      {{ permission.name }}
                    </el-tag>
                    <div v-if="selectedButtonCount === 0" class="empty-tip">
                      未选择任何按钮权限
                    </div>
                  </div>
                </div>

                <!-- 接口权限 -->
                <div class="preview-section">
                  <div class="section-header">
                    <h5>接口权限 ({{ selectedApiCount }})</h5>
                    <el-button type="text" size="small" @click="clearApi">清空</el-button>
                  </div>
                  <div class="section-content">
                    <el-tag
                      v-for="permission in selectedApiPermissions"
                      :key="permission.id"
                      type="info"
                      class="preview-tag"
                      closable
                      @close="removePermission(permission.id, 'api')"
                    >
                      {{ permission.code }}
                    </el-tag>
                    <div v-if="selectedApiCount === 0" class="empty-tip">
                      未选择任何接口权限
                    </div>
                  </div>
                </div>
              </div>

              <!-- 统计信息 -->
              <div class="preview-stats">
                <div class="stats-item">
                  <span class="stats-label">总权限数：</span>
                  <span class="stats-value">{{ totalPermissionCount }}</span>
                </div>
                <div class="stats-item">
                  <span class="stats-label">已选择：</span>
                  <span class="stats-value selected-count">{{ totalSelectedCount }}</span>
                </div>
                <div class="stats-item">
                  <span class="stats-label">覆盖率：</span>
                  <span class="stats-value">
                    {{ coverageRate }}%
                  </span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 未选择角色提示 -->
    <div class="empty-state" v-else>
      <el-empty description="请选择一个角色开始配置权限">
        <template #image>
          <img src="@/assets/images/empty-role.svg" alt="空状态" style="width: 200px;" />
        </template>
        <el-button type="primary" @click="createRole">
          新建角色
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PermissionTree from './PermissionTree.vue'
import type { Role, Permission, PermissionTree } from '@/types/api'

interface Props {
  // 角色列表
  roles?: Role[]
  // 所有权限数据
  permissions?: PermissionTree[]
  // 是否显示角色选择器
  showRoleSelector?: boolean
  // 初始选中的角色ID
  initialRoleId?: string
}

interface Emits {
  (e: 'update:initialRoleId', value: string): void
  (e: 'change', value: { roleId: string; permissionIds: string[] }): void
  (e: 'save', value: { roleId: string; permissionIds: string[] }): void
  (e: 'role-change', roleId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  permissions: () => [],
  showRoleSelector: true,
  initialRoleId: ''
})

const emit = defineEmits<Emits>()

// 组件引用
const menuTreeRef = ref<InstanceType<typeof PermissionTree>>()
const buttonTreeRef = ref<InstanceType<typeof PermissionTree>>()
const apiTreeRef = ref<InstanceType<typeof PermissionTree>>()

// 状态
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('menu')

// 表单数据
const form = reactive({
  roleId: props.initialRoleId
})

// 权限数据
const allPermissions = ref<PermissionTree[]>([])
const menuPermissions = ref<PermissionTree[]>([])
const buttonPermissions = ref<PermissionTree[]>([])
const apiPermissions = ref<PermissionTree[]>([])

// 选中的权限ID
const selectedMenuIds = ref<string[]>([])
const selectedButtonIds = ref<string[]>([])
const selectedApiIds = ref<string[]>([])

// 当前角色
const currentRole = ref<Role | null>(null)

// 计算属性
const selectedMenuPermissions = computed(() => {
  return getPermissionsByIds(selectedMenuIds.value, allPermissions.value)
})

const selectedButtonPermissions = computed(() => {
  return getPermissionsByIds(selectedButtonIds.value, allPermissions.value)
})

const selectedApiPermissions = computed(() => {
  return getPermissionsByIds(selectedApiIds.value, allPermissions.value)
})

const selectedMenuCount = computed(() => selectedMenuIds.value.length)
const selectedButtonCount = computed(() => selectedButtonIds.value.length)
const selectedApiCount = computed(() => selectedApiIds.value.length)

const totalSelectedCount = computed(() => {
  return selectedMenuCount.value + selectedButtonCount.value + selectedApiCount.value
})

const totalPermissionCount = computed(() => {
  return countAllPermissions(allPermissions.value)
})

const coverageRate = computed(() => {
  if (totalPermissionCount.value === 0) return 0
  return Math.round((totalSelectedCount.value / totalPermissionCount.value) * 100)
})

// 方法
// 根据ID获取权限
const getPermissionsByIds = (ids: string[], permissions: PermissionTree[]): Permission[] => {
  const result: Permission[] = []

  const traverse = (nodes: PermissionTree[]) => {
    nodes.forEach(node => {
      if (ids.includes(node.id)) {
        result.push(node)
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(permissions)
  return result
}

// 统计所有权限数量
const countAllPermissions = (permissions: PermissionTree[]): number => {
  let count = 0

  const traverse = (nodes: PermissionTree[]) => {
    nodes.forEach(node => {
      count++
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(permissions)
  return count
}

// 按类型过滤权限
const filterPermissionsByType = (permissions: PermissionTree[], type: number): PermissionTree[] => {
  const result: PermissionTree[] = []

  const traverse = (nodes: PermissionTree[]) => {
    nodes.forEach(node => {
      if (node.type === type) {
        const newNode = { ...node }
        if (node.children && node.children.length > 0) {
          newNode.children = filterPermissionsByType(node.children, type)
        } else {
          newNode.children = []
        }
        result.push(newNode)
      } else if (node.children && node.children.length > 0) {
        const children = filterPermissionsByType(node.children, type)
        if (children.length > 0) {
          result.push({
            ...node,
            children
          })
        }
      }
    })
  }

  traverse(permissions)
  return result
}

// 处理角色变化
const handleRoleChange = (roleId: string) => {
  emit('update:initialRoleId', roleId)
  emit('role-change', roleId)

  if (!roleId) {
    currentRole.value = null
    return
  }

  const role = props.roles.find(r => r.id === roleId)
  if (role) {
    currentRole.value = role
    loadRolePermissions()
  }
}

// 加载角色权限
const loadRolePermissions = async () => {
  if (!currentRole.value) return

  try {
    loading.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 这里应该调用API获取角色的权限
    const rolePermissions: string[] = [] // 从API获取

    // 分离不同类型的权限ID
    selectedMenuIds.value = rolePermissions.filter(id => {
      const permission = findPermissionById(id, allPermissions.value)
      return permission?.type === 1
    })

    selectedButtonIds.value = rolePermissions.filter(id => {
      const permission = findPermissionById(id, allPermissions.value)
      return permission?.type === 2
    })

    selectedApiIds.value = rolePermissions.filter(id => {
      const permission = findPermissionById(id, allPermissions.value)
      return permission?.type === 3
    })

    // 更新树组件
    nextTick(() => {
      menuTreeRef.value?.reset()
      buttonTreeRef.value?.reset()
      apiTreeRef.value?.reset()
    })

  } catch (error) {
    console.error('加载权限失败:', error)
    ElMessage.error('加载权限失败')
  } finally {
    loading.value = false
  }
}

// 根据ID查找权限
const findPermissionById = (id: string, permissions: PermissionTree[]): Permission | null => {
  for (const permission of permissions) {
    if (permission.id === id) return permission
    if (permission.children && permission.children.length > 0) {
      const found = findPermissionById(id, permission.children)
      if (found) return found
    }
  }
  return null
}

// 处理菜单权限变化
const handleMenuChange = (ids: string[]) => {
  selectedMenuIds.value = ids
  emitChange()
}

// 处理按钮权限变化
const handleButtonChange = (ids: string[]) => {
  selectedButtonIds.value = ids
  emitChange()
}

// 处理接口权限变化
const handleApiChange = (ids: string[]) => {
  selectedApiIds.value = ids
  emitChange()
}

// 触发变化事件
const emitChange = () => {
  if (!currentRole.value) return

  const allSelectedIds = [
    ...selectedMenuIds.value,
    ...selectedButtonIds.value,
    ...selectedApiIds.value
  ]

  emit('change', {
    roleId: currentRole.value.id,
    permissionIds: allSelectedIds
  })
}

// 保存权限
const savePermissions = async () => {
  if (!currentRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  try {
    saving.value = true

    const allSelectedIds = [
      ...selectedMenuIds.value,
      ...selectedButtonIds.value,
      ...selectedApiIds.value
    ]

    // 这里调用保存API
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('权限保存成功')

    emit('save', {
      roleId: currentRole.value.id,
      permissionIds: allSelectedIds
    })

  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage.error('保存权限失败')
  } finally {
    saving.value = false
  }
}

// 复制权限
const copyPermissions = async () => {
  if (!currentRole.value) return

  const allSelectedIds = [
    ...selectedMenuIds.value,
    ...selectedButtonIds.value,
    ...selectedApiIds.value
  ]

  try {
    await navigator.clipboard.writeText(allSelectedIds.join(','))
    ElMessage.success('权限ID已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 导出权限配置
const exportPermissions = () => {
  if (!currentRole.value) return

  const config = {
    roleId: currentRole.value.id,
    roleName: currentRole.value.name,
    menuPermissions: selectedMenuPermissions.value.map(p => ({
      id: p.id,
      name: p.name,
      code: p.code
    })),
    buttonPermissions: selectedButtonPermissions.value.map(p => ({
      id: p.id,
      name: p.name,
      code: p.code
    })),
    apiPermissions: selectedApiPermissions.value.map(p => ({
      id: p.id,
      name: p.name,
      code: p.code
    })),
    exportTime: new Date().toISOString()
  }

  const dataStr = JSON.stringify(config, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileDefaultName = `${currentRole.value.name}_权限配置_${new Date().getTime()}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

// 清空菜单权限
const clearMenu = () => {
  selectedMenuIds.value = []
  menuTreeRef.value?.uncheckAll()
}

// 清空按钮权限
const clearButton = () => {
  selectedButtonIds.value = []
  buttonTreeRef.value?.uncheckAll()
}

// 清空接口权限
const clearApi = () => {
  selectedApiIds.value = []
  apiTreeRef.value?.uncheckAll()
}

// 清空全部
const clearAll = () => {
  ElMessageBox.confirm(
    '确定要清空所有已选择的权限吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    clearMenu()
    clearButton()
    clearApi()
  })
}

// 移除单个权限
const removePermission = (id: string, type: 'menu' | 'button' | 'api') => {
  switch (type) {
    case 'menu':
      selectedMenuIds.value = selectedMenuIds.value.filter(item => item !== id)
      break
    case 'button':
      selectedButtonIds.value = selectedButtonIds.value.filter(item => item !== id)
      break
    case 'api':
      selectedApiIds.value = selectedApiIds.value.filter(item => item !== id)
      break
  }
}

// 重置
const reset = () => {
  form.roleId = ''
  currentRole.value = null
  selectedMenuIds.value = []
  selectedButtonIds.value = []
  selectedApiIds.value = []
}

// 创建角色
const createRole = () => {
  console.log('创建角色')
  // 这里可以打开创建角色的弹窗或跳转到创建页面
}

// 初始化权限数据
const initPermissions = () => {
  allPermissions.value = props.permissions

  // 按类型分离权限
  menuPermissions.value = filterPermissionsByType(allPermissions.value, 1)
  buttonPermissions.value = filterPermissionsByType(allPermissions.value, 2)
  apiPermissions.value = filterPermissionsByType(allPermissions.value, 3)
}

// 监听外部数据变化
watch(() => props.permissions, initPermissions, { immediate: true })
watch(() => props.initialRoleId, (value) => {
  form.roleId = value
  if (value) {
    handleRoleChange(value)
  }
}, { immediate: true })

// 暴露方法给父组件
defineExpose({
  getSelectedPermissions: () => ({
    menu: selectedMenuIds.value,
    button: selectedButtonIds.value,
    api: selectedApiIds.value
  }),
  savePermissions,
  reset,
  loadRolePermissions
})
</script>

<style lang="scss" scoped>
.role-permission-container {
  .role-selector {
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;

    .role-option {
      display: flex;
      align-items: center;
      gap: 8px;

      .role-desc {
        flex: 1;
        font-size: 12px;
        color: #999;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .permission-config {
    .role-info {
      background: white;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .role-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .role-name {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-actions {
          display: flex;
          gap: 8px;
        }
      }

      .role-description {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }

    .permission-tabs {
      .permission-preview {
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;

          h4 {
            margin: 0;
            font-size: 16px;
            color: #333;
          }
        }

        .preview-content {
          .preview-section {
            margin-bottom: 24px;

            &:last-child {
              margin-bottom: 0;
            }

            .section-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;

              h5 {
                margin: 0;
                font-size: 14px;
                color: #333;
                display: flex;
                align-items: center;
                gap: 8px;
              }
            }

            .section-content {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              min-height: 36px;

              .preview-tag {
                margin-bottom: 4px;
              }

              .empty-tip {
                width: 100%;
                text-align: center;
                color: #999;
                font-size: 14px;
                padding: 8px 0;
              }
            }
          }
        }

        .preview-stats {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 24px;

          .stats-item {
            display: flex;
            align-items: center;
            gap: 4px;

            .stats-label {
              font-size: 14px;
              color: #666;
            }

            .stats-value {
              font-size: 16px;
              font-weight: 600;
              color: #333;

              &.selected-count {
                color: #409EFF;
              }
            }
          }
        }
      }
    }
  }

  .empty-state {
    padding: 40px 0;
  }
}
</style>