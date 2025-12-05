<template>
  <div class="permission-management">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="权限名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入权限名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入权限编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select v-model="searchForm.type" placeholder="请选择权限类型" clearable>
            <el-option label="菜单权限" :value="1" />
            <el-option label="按钮权限" :value="2" />
            <el-option label="接口权限" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否系统">
          <el-select v-model="searchForm.isSystem" placeholder="请选择" clearable>
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否可见">
          <el-select v-model="searchForm.isVisible" placeholder="请选择" clearable>
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="info" @click="toggleAdvancedSearch">
            <el-icon>
              <component :is="showAdvanced ? 'ArrowUp' : 'ArrowDown'" />
            </el-icon>
            {{ showAdvanced ? '收起' : '展开' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级搜索 -->
      <el-collapse-transition>
        <div v-show="showAdvanced" class="advanced-search">
          <el-divider />
          <el-form :model="searchForm" inline>
            <el-form-item label="父级权限">
              <el-tree-select
                v-model="searchForm.parentId"
                :data="permissionTree"
                :props="{ label: 'name', value: 'id' }"
                placeholder="请选择父级权限"
                clearable
                filterable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                clearable
              />
            </el-form-item>
            <el-form-item label="排序方式">
              <el-select v-model="searchForm.sortField" placeholder="请选择排序字段" clearable>
                <el-option label="创建时间" value="createdAt" />
                <el-option label="排序值" value="sort" />
                <el-option label="权限名称" value="name" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.sortOrder" placeholder="排序顺序" clearable>
                <el-option label="升序" value="asc" />
                <el-option label="降序" value="desc" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-buttons">
        <el-button
          type="primary"
          @click="handleAdd"
          v-permission="'system:permission:add'"
        >
          <el-icon><Plus /></el-icon>
          新增权限
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
          v-permission="'system:permission:delete'"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出权限
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入权限
        </el-button>
        <el-button @click="showTreeView = !showTreeView">
          <el-icon>
            <component :is="showTreeView ? 'Menu' : 'DataLine'" />
          </el-icon>
          {{ showTreeView ? '列表视图' : '树形视图' }}
        </el-button>
      </div>
    </el-card>

    <!-- 数据展示 -->
    <el-card class="data-card" shadow="never">
      <!-- 树形视图 -->
      <div v-if="showTreeView" class="tree-view-container">
        <PermissionTree
          ref="permissionTreeRef"
          :data="permissionTree"
          :show-operations="true"
          :show-statistics="true"
          height="600"
          @edit="handleTreeEdit"
          @delete="handleTreeDelete"
          @add="handleTreeAdd"
        />
      </div>

      <!-- 列表视图 -->
      <div v-else>
        <el-table
          v-loading="loading"
          :data="permissionList"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :default-expand-all="false"
          @selection-change="handleSelectionChange"
          stripe
          border
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="name" label="权限名称" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="permission-name">
                <el-icon v-if="row.icon" class="permission-icon">
                  <component :is="row.icon" />
                </el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="权限编码" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.code }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="权限类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getPermissionType(row.type).type" size="small">
                {{ getPermissionType(row.type).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路径" min-width="150" show-overflow-tooltip />
          <el-table-column prop="component" label="组件" min-width="150" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="80" align="center">
            <template #default="{ row }">
              <el-input-number
                v-if="row.editing"
                v-model="row.sort"
                :min="0"
                :max="999"
                size="small"
                @blur="saveSort(row)"
              />
              <span v-else>{{ row.sort }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="isVisible" label="是否可见" width="90" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.isVisible"
                :active-value="true"
                :inactive-value="false"
                @change="updatePermissionStatus(row, 'isVisible')"
              />
            </template>
          </el-table-column>
          <el-table-column prop="isSystem" label="系统权限" width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isSystem" type="danger" size="small">是</el-tag>
              <el-tag v-else type="info" size="small">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
                v-permission="'system:permission:edit'"
              >
                编辑
              </el-button>
              <el-button
                type="success"
                link
                size="small"
                @click="handleAddChild(row)"
                v-permission="'system:permission:add'"
              >
                添加子项
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
                v-permission="'system:permission:delete'"
                :disabled="row.isSystem"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pageParams.page"
            v-model:page-size="pageParams.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 权限表单弹窗 -->
    <PermissionForm
      ref="permissionFormRef"
      v-model="showFormDialog"
      :current-row="currentRow"
      :parent-permission="parentPermission"
      @success="handleFormSuccess"
    />

    <!-- 导入弹窗 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入权限"
      width="500px"
      @close="handleImportClose"
    >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        action="/api/permissions/import"
        :headers="uploadHeaders"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        :before-upload="beforeUpload"
        :show-file-list="true"
        :limit="1"
        accept=".xlsx,.xls,.csv"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .xlsx, .xls, .csv 格式文件，大小不超过 10MB
            <el-link type="primary" :underline="false" @click="downloadTemplate">
              下载模板
            </el-link>
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="submitImport">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type UploadInstance } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Menu,
  DataLine,
  UploadFilled
} from '@element-plus/icons-vue'
import { permissionApi } from '@/api/modules/permission'
import type { Permission, PageParams } from '@/types/api'
import { formatDate } from '@/utils/format'
import PermissionTree from '@/components/business/PermissionTree.vue'
import PermissionForm from './PermissionForm.vue'

// 组件引用
const permissionFormRef = ref()
const permissionTreeRef = ref<InstanceType<typeof PermissionTree>>()
const uploadRef = ref<UploadInstance>()

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  type: undefined as number | undefined,
  isSystem: undefined as boolean | undefined,
  isVisible: undefined as boolean | undefined,
  parentId: '',
  createTimeRange: [] as string[],
  sortField: '',
  sortOrder: ''
})

// 分页参数
const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 10
})

// 数据状态
const loading = ref(false)
const permissionList = ref<Permission[]>([])
const permissionTree = ref<PermissionTree[]>([])
const total = ref(0)
const selectedRows = ref<Permission[]>([])
const currentRow = ref<Permission | null>(null)
const parentPermission = ref<Permission | null>(null)

// UI状态
const showAdvanced = ref(false)
const showTreeView = ref(false)
const showFormDialog = ref(false)
const showImportDialog = ref(false)

// 上传配置
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

// 获取权限列表
const fetchPermissionList = async () => {
  try {
    loading.value = true

    // 构建查询参数
    const params: any = { ...searchForm, ...pageParams }

    // 处理创建时间范围
    if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
      params.startTime = searchForm.createTimeRange[0]
      params.endTime = searchForm.createTimeRange[1]
    }

    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key]
      }
    })

    const { data } = await permissionApi.getList(params)
    permissionList.value = data.items
    total.value = data.total

  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const { data } = await permissionApi.getTree()
    permissionTree.value = data
  } catch (error) {
    console.error('获取权限树失败:', error)
  }
}

// 获取权限类型信息
const getPermissionType = (type: number) => {
  const typeMap: Record<number, { text: string; type: string }> = {
    1: { text: '菜单', type: 'success' },
    2: { text: '按钮', type: 'warning' },
    3: { text: '接口', type: 'info' }
  }
  return typeMap[type] || { text: '未知', type: 'info' }
}

// 搜索
const handleSearch = () => {
  pageParams.page = 1
  fetchPermissionList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'createTimeRange') {
      searchForm[key] = []
    } else {
      searchForm[key] = '' as any
    }
  })
  pageParams.page = 1
  fetchPermissionList()
}

// 切换高级搜索
const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value
}

// 选择行
const handleSelectionChange = (rows: Permission[]) => {
  selectedRows.value = rows
}

// 新增权限
const handleAdd = () => {
  currentRow.value = null
  parentPermission.value = null
  showFormDialog.value = true
}

// 添加子权限
const handleAddChild = (row: Permission) => {
  currentRow.value = null
  parentPermission.value = row
  showFormDialog.value = true
}

// 编辑权限
const handleEdit = (row: Permission) => {
  currentRow.value = { ...row }
  parentPermission.value = null
  showFormDialog.value = true
}

// 树形视图编辑
const handleTreeEdit = (node: Permission) => {
  handleEdit(node)
}

// 树形视图删除
const handleTreeDelete = async (node: Permission) => {
  await handleDelete(node)
}

// 树形视图添加
const handleTreeAdd = (parentNode?: Permission) => {
  if (parentNode) {
    handleAddChild(parentNode)
  } else {
    handleAdd()
  }
}

// 删除权限
const handleDelete = async (row: Permission) => {
  if (row.isSystem) {
    ElMessage.warning('系统权限不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除权限 "${row.name}" 吗？删除后无法恢复！`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            try {
              await permissionApi.delete(row.id)
              ElMessage.success('删除成功')
              fetchPermissionList()
              fetchPermissionTree()
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
  } catch (error) {
    // 取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return

  // 检查是否包含系统权限
  const systemPermissions = selectedRows.value.filter(row => row.isSystem)
  if (systemPermissions.length > 0) {
    ElMessage.warning('选择的权限中包含系统权限，系统权限不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedRows.value.length} 个权限吗？删除后无法恢复！`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            try {
              const ids = selectedRows.value.map(permission => permission.id)
              await permissionApi.batchDelete(ids)
              ElMessage.success('批量删除成功')
              selectedRows.value = []
              fetchPermissionList()
              fetchPermissionTree()
              done()
            } catch (error) {
              console.error('批量删除失败:', error)
              ElMessage.error('批量删除失败')
            } finally {
              instance.confirmButtonLoading = false
            }
          } else {
            done()
          }
        }
      }
    )
  } catch (error) {
    // 取消删除
  }
}

// 导出权限
const handleExport = async () => {
  try {
    loading.value = true

    const params: any = { ...searchForm }

    // 处理创建时间范围
    if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
      params.startTime = searchForm.createTimeRange[0]
      params.endTime = searchForm.createTimeRange[1]
    }

    const data = await permissionApi.export(params)

    // 创建下载链接
    const blob = new Blob([data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `权限列表_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

// 显示导入弹窗
const handleImport = () => {
  showImportDialog.value = true
}

// 导入关闭
const handleImportClose = () => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 上传前检查
const beforeUpload = (file: File) => {
  const isExcel = file.type.includes('excel') || file.type.includes('spreadsheet')
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel && !isCSV) {
    ElMessage.error('只能上传 Excel 或 CSV 文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }

  return true
}

// 导入成功
const handleImportSuccess = (response: any) => {
  if (response.code === 200) {
    ElMessage.success('导入成功')
    showImportDialog.value = false
    fetchPermissionList()
    fetchPermissionTree()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

// 导入失败
const handleImportError = (error: any) => {
  console.error('导入失败:', error)
  ElMessage.error('导入失败，请重试')
}

// 提交导入
const submitImport = () => {
  if (uploadRef.value) {
    uploadRef.value.submit()
  }
}

// 下载模板
const downloadTemplate = async () => {
  try {
    const data = await permissionApi.exportTemplate()

    // 创建下载链接
    const blob = new Blob([data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '权限导入模板.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  }
}

// 保存排序
const saveSort = async (row: Permission) => {
  try {
    await permissionApi.update(row.id, { sort: row.sort })
    row.editing = false
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
    fetchPermissionList()
  }
}

// 更新权限状态
const updatePermissionStatus = async (row: Permission, field: 'isVisible') => {
  try {
    await permissionApi.update(row.id, { [field]: row[field] })
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
    // 恢复原值
    row[field] = !row[field]
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageParams.pageSize = size
  fetchPermissionList()
}

// 页码变化
const handlePageChange = (page: number) => {
  pageParams.page = page
  fetchPermissionList()
}

// 表单提交成功
const handleFormSuccess = () => {
  showFormDialog.value = false
  fetchPermissionList()
  fetchPermissionTree()
}

// 初始化
onMounted(() => {
  fetchPermissionList()
  fetchPermissionTree()
})
</script>

<style lang="scss" scoped>
.permission-management {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .advanced-search {
      margin-top: 20px;
    }
  }

  .operation-card {
    margin-bottom: 20px;

    .operation-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
  }

  .data-card {
    .tree-view-container {
      padding: 10px;
    }

    .permission-name {
      display: flex;
      align-items: center;
      gap: 8px;

      .permission-icon {
        color: #409EFF;
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .upload-demo {
    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
    }

    .el-upload__tip {
      margin-top: 10px;
      font-size: 12px;
      color: #666;

      .el-link {
        margin-left: 5px;
      }
    }
  }
}
</style>