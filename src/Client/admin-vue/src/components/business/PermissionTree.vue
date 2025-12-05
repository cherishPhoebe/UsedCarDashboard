<template>
  <div class="permission-tree-container">
    <!-- 操作栏 -->
    <div class="tree-operations" v-if="showOperations">
      <el-input
        v-model="filterText"
        placeholder="搜索权限..."
        clearable
        size="small"
        class="tree-search"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div class="operation-buttons">
        <el-button size="small" @click="expandAll">
          <el-icon><Expand /></el-icon>
          展开全部
        </el-button>
        <el-button size="small" @click="collapseAll">
          <el-icon><Fold /></el-icon>
          折叠全部
        </el-button>
        <el-button size="small" @click="checkAll">
          <el-icon><Check /></el-icon>
          全选
        </el-button>
        <el-button size="small" @click="uncheckAll">
          <el-icon><Close /></el-icon>
          全不选
        </el-button>
        <el-button size="small" @click="reset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 权限树 -->
    <el-scrollbar class="tree-wrapper" :height="height">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        :default-expanded-keys="defaultExpandedKeys"
        :default-checked-keys="defaultCheckedKeys"
        show-checkbox
        node-key="id"
        highlight-current
        @check="handleCheck"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="node-content">
              <div class="node-info">
                <el-icon v-if="data.icon" class="node-icon">
                  <component :is="data.icon" />
                </el-icon>
                <span class="node-label">{{ data.name }}</span>
                <el-tag v-if="data.type === 1" type="success" size="small">菜单</el-tag>
                <el-tag v-if="data.type === 2" type="warning" size="small">按钮</el-tag>
                <el-tag v-if="data.type === 3" type="info" size="small">接口</el-tag>
                <el-tag v-if="data.isSystem" type="danger" size="small">系统</el-tag>
              </div>
              <div class="node-extra">
                <span class="node-code">{{ data.code }}</span>
                <span class="node-path" v-if="data.path">{{ data.path }}</span>
              </div>
            </div>
            <div class="node-actions" v-if="showOperations">
              <el-button type="text" size="small" @click.stop="editNode(data)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="text" size="small" @click.stop="deleteNode(data)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>

    <!-- 底部统计 -->
    <div class="tree-footer" v-if="showStatistics">
      <div class="statistics">
        <div class="stat-item">
          <span class="stat-label">总权限数：</span>
          <span class="stat-value">{{ totalCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已选择：</span>
          <span class="stat-value selected-count">{{ selectedCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">菜单权限：</span>
          <span class="stat-value">{{ menuCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">操作权限：</span>
          <span class="stat-value">{{ operationCount }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" />
        </el-form-item>

        <el-form-item label="权限编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入权限编码，如：system:user:view">
            <template #prepend>
              <el-select v-model="formData.module" placeholder="模块" style="width: 100px">
                <el-option label="系统管理" value="system" />
                <el-option label="用户管理" value="user" />
                <el-option label="角色管理" value="role" />
                <el-option label="权限管理" value="permission" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :label="1">菜单权限</el-radio>
            <el-radio :label="2">按钮权限</el-radio>
            <el-radio :label="3">接口权限</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上级权限" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="treeOptions"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择上级权限"
            clearable
            filterable
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称，如：User" />
        </el-form-item>

        <el-form-item label="路径" prop="path" v-if="formData.type === 1">
          <el-input v-model="formData.path" placeholder="请输入路由路径" />
        </el-form-item>

        <el-form-item label="组件" prop="component" v-if="formData.type === 1">
          <el-input v-model="formData.component" placeholder="请输入组件路径" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Search,
  Expand,
  Fold,
  Check,
  Close,
  Refresh,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import type { Permission, PermissionTree } from '@/types/api'

interface Props {
  // 权限树数据
  data?: PermissionTree[]
  // 默认选中的权限ID
  value?: string[]
  // 是否显示操作按钮
  showOperations?: boolean
  // 是否显示统计信息
  showStatistics?: boolean
  // 树高度
  height?: string | number
  // 只读模式
  readonly?: boolean
}

interface Emits {
  (e: 'update:value', value: string[]): void
  (e: 'change', value: string[]): void
  (e: 'check', nodes: Permission[]): void
  (e: 'edit', node: Permission): void
  (e: 'delete', node: Permission): void
  (e: 'add', node: Permission): void
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  value: () => [],
  showOperations: true,
  showStatistics: true,
  height: '400px',
  readonly: false
})

const emit = defineEmits<Emits>()

// 树引用
const treeRef = ref()
const formRef = ref<FormInstance>()

// 数据
const filterText = ref('')
const treeData = ref<PermissionTree[]>([])
const defaultExpandedKeys = ref<string[]>([])
const defaultCheckedKeys = ref<string[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  type: 1,
  parentId: '',
  sort: 0,
  icon: '',
  path: '',
  component: '',
  description: '',
  module: 'system'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-z]+:[a-z]+:[a-z]+$/, message: '格式如：system:user:view', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 计算属性
const selectedKeys = computed(() => {
  return treeRef.value?.getCheckedKeys() || []
})

const selectedNodes = computed(() => {
  return treeRef.value?.getCheckedNodes() || []
})

const totalCount = computed(() => {
  return countNodes(treeData.value)
})

const selectedCount = computed(() => {
  return selectedKeys.value.length
})

const menuCount = computed(() => {
  return countByType(selectedNodes.value, 1)
})

const operationCount = computed(() => {
  return countByType(selectedNodes.value, 2) + countByType(selectedNodes.value, 3)
})

const treeOptions = computed(() => {
  const options: PermissionTree[] = [
    {
      id: '',
      name: '根节点',
      code: 'root',
      type: 1,
      sort: 0,
      children: treeData.value
    }
  ]
  return options
})

// 方法
const countNodes = (nodes: PermissionTree[]): number => {
  let count = 0
  nodes.forEach(node => {
    count++
    if (node.children && node.children.length > 0) {
      count += countNodes(node.children)
    }
  })
  return count
}

const countByType = (nodes: Permission[], type: number): number => {
  return nodes.filter(node => node.type === type).length
}

// 过滤节点
const filterNode = (value: string, data: PermissionTree) => {
  if (!value) return true
  return data.name.includes(value) || data.code.includes(value)
}

// 处理选中
const handleCheck = (data: PermissionTree, checked: any) => {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const checkedNodes = treeRef.value?.getCheckedNodes() || []

  emit('update:value', checkedKeys)
  emit('change', checkedKeys)
  emit('check', checkedNodes)
}

// 处理节点点击
const handleNodeClick = (data: PermissionTree) => {
  console.log('节点点击:', data)
}

// 展开全部
const expandAll = () => {
  treeData.value.forEach(node => {
    defaultExpandedKeys.value = getAllNodeKeys(node)
  })
  nextTick(() => {
    treeRef.value?.setCurrentKey(null)
  })
}

// 折叠全部
const collapseAll = () => {
  defaultExpandedKeys.value = []
}

// 全选
const checkAll = () => {
  const allKeys = getAllNodeKeys(treeData.value)
  treeRef.value?.setCheckedKeys(allKeys)
}

// 全不选
const uncheckAll = () => {
  treeRef.value?.setCheckedKeys([])
}

// 重置
const reset = () => {
  treeRef.value?.setCheckedKeys(props.value)
}

// 获取所有节点key
const getAllNodeKeys = (data: PermissionTree | PermissionTree[]): string[] => {
  const keys: string[] = []

  const traverse = (node: PermissionTree) => {
    keys.push(node.id)
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child))
    }
  }

  if (Array.isArray(data)) {
    data.forEach(node => traverse(node))
  } else {
    traverse(data)
  }

  return keys
}

// 编辑节点
const editNode = (node: Permission) => {
  dialogTitle.value = '编辑权限'
  Object.assign(formData, node)
  dialogVisible.value = true
  emit('edit', node)
}

// 删除节点
const deleteNode = (node: Permission) => {
  ElMessageBox.confirm(
    `确定删除权限 "${node.name}" 吗？删除后不可恢复！`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      beforeClose: async (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          try {
            // 这里调用删除API
            await new Promise(resolve => setTimeout(resolve, 500))
            ElMessage.success('删除成功')
            emit('delete', node)
            done()
          } catch (error) {
            console.error('删除失败:', error)
            ElMessage.error('删除失败')
          } finally {
            instance.confirmButtonLoading = false
          }
        } else {
          done()
        }
      }
    }
  )
}

// 添加节点
const addNode = (parentNode?: Permission) => {
  dialogTitle.value = '新增权限'
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  formData.type = 1
  formData.sort = 0
  formData.parentId = parentNode?.id || ''
  dialogVisible.value = true
}

// 处理弹窗关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 这里调用保存API
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success(dialogTitle.value + '成功')
    dialogVisible.value = false

    // 触发新增事件
    emit('add', { ...formData })

  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

// 监听过滤文本
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 监听外部数据变化
watch(() => props.data, (newData) => {
  treeData.value = newData
  // 默认展开一级
  defaultExpandedKeys.value = newData.map(node => node.id)
}, { immediate: true })

watch(() => props.value, (newValue) => {
  defaultCheckedKeys.value = newValue
}, { immediate: true })

// 暴露方法给父组件
defineExpose({
  getSelectedKeys: () => selectedKeys.value,
  getSelectedNodes: () => selectedNodes.value,
  addNode,
  editNode,
  deleteNode,
  expandAll,
  collapseAll,
  checkAll,
  uncheckAll,
  reset
})
</script>

<style lang="scss" scoped>
.permission-tree-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;

  .tree-operations {
    padding: 12px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    gap: 12px;
    align-items: center;

    .tree-search {
      flex: 1;
      max-width: 300px;
    }

    .operation-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .tree-wrapper {
    padding: 12px;

    :deep(.el-tree) {
      .tree-node {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 4px 0;

        .node-content {
          flex: 1;
          min-width: 0;

          .node-info {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;

            .node-icon {
              color: #409EFF;
              font-size: 14px;
            }

            .node-label {
              font-size: 14px;
              color: #303133;
            }

            .el-tag {
              height: 18px;
              line-height: 16px;
              font-size: 10px;
              padding: 0 4px;
            }
          }

          .node-extra {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #909399;

            .node-code {
              font-family: 'Courier New', monospace;
              color: #409EFF;
            }

            .node-path {
              color: #67C23A;
            }
          }
        }

        .node-actions {
          opacity: 0;
          transition: opacity 0.3s;

          .el-button {
            padding: 4px;
            margin-left: 4px;
          }
        }

        &:hover {
          .node-actions {
            opacity: 1;
          }
        }
      }

      .el-tree-node__content {
        height: auto;
        padding: 4px 0;
      }

      .el-tree-node.is-checked .node-label {
        color: #409EFF;
        font-weight: 500;
      }
    }
  }

  .tree-footer {
    padding: 12px;
    background-color: #f5f7fa;
    border-top: 1px solid #e4e7ed;

    .statistics {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .stat-label {
          font-size: 12px;
          color: #909399;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #303133;

          &.selected-count {
            color: #409EFF;
          }
        }
      }
    }
  }
}
</style>