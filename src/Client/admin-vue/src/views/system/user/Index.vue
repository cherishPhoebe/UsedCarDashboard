<template>
  <div class="user-management">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-buttons">
        <el-button
          type="primary"
          @click="handleAdd"
          v-permission="'system:user:add'"
        >
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
          v-permission="'system:user:delete'"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="roles" label="角色" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              class="role-tag"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
              v-permission="'system:user:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="success"
              link
              size="small"
              @click="handleResetPassword(row)"
              v-permission="'system:user:reset-password'"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
              v-permission="'system:user:delete'"
            >
              删除
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              @click="handleAssignRole(row)"
              v-permission="'system:user:assign-role'"
            >
              分配角色
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
    </el-card>

    <!-- 用户表单弹窗 -->
    <UserForm
      ref="userFormRef"
      v-model="showFormDialog"
      :current-row="currentRow"
      @success="handleFormSuccess"
    />

    <!-- 分配角色弹窗 -->
    <AssignRole
      ref="assignRoleRef"
      v-model="showAssignRoleDialog"
      :user-id="currentRow?.id"
      @success="handleAssignRoleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Download
} from '@element-plus/icons-vue'
import { userApi } from '@/api/modules/user'
import type { User, PageParams } from '@/types/api'
import { formatDate } from '@/utils/format'
import UserForm from './UserForm.vue'
import AssignRole from './AssignRole.vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: undefined as number | undefined
})

// 分页参数
const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 10
})

// 数据
const loading = ref(false)
const userList = ref<User[]>([])
const total = ref(0)
const selectedRows = ref<User[]>([])
const currentRow = ref<User | null>(null)

// 弹窗控制
const showFormDialog = ref(false)
const showAssignRoleDialog = ref(false)
const userFormRef = ref()
const assignRoleRef = ref()

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true
    const { data } = await userApi.getList({
      ...searchForm,
      ...pageParams
    })
    userList.value = data.items
    total.value = data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageParams.page = 1
  fetchUserList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pageParams.page = 1
  fetchUserList()
}

// 选择行
const handleSelectionChange = (rows: User[]) => {
  selectedRows.value = rows
}

// 新增用户
const handleAdd = () => {
  currentRow.value = null
  showFormDialog.value = true
}

// 编辑用户
const handleEdit = (row: User) => {
  currentRow.value = { ...row }
  showFormDialog.value = true
}

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定删除用户 "${row.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await userApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchUserList()
  } catch (error) {
    // 取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(user => user.id)
    await userApi.batchDelete(ids)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    fetchUserList()
  } catch (error) {
    // 取消删除
  }
}

// 分配角色
const handleAssignRole = (row: User) => {
  currentRow.value = row
  showAssignRoleDialog.value = true
}

// 重置密码
const handleResetPassword = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定重置用户 "${row.username}" 的密码吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputPlaceholder: '请输入新密码',
        inputType: 'password'
      }
    )

    // 这里调用重置密码API
    ElMessage.success('密码重置成功')
  } catch (error) {
    // 取消重置
  }
}

// 导出
const handleExport = async () => {
  try {
    const data = await userApi.export(searchForm)
    // 创建下载链接
    const blob = new Blob([data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `用户列表_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageParams.pageSize = size
  fetchUserList()
}

// 页码变化
const handlePageChange = (page: number) => {
  pageParams.page = page
  fetchUserList()
}

// 表单提交成功
const handleFormSuccess = () => {
  showFormDialog.value = false
  fetchUserList()
}

// 分配角色成功
const handleAssignRoleSuccess = () => {
  showAssignRoleDialog.value = false
  fetchUserList()
}

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style lang="scss" scoped>
.user-management {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .operation-card {
    margin-bottom: 20px;

    .operation-buttons {
      display: flex;
      gap: 10px;
    }
  }

  .table-card {
    .role-tag {
      margin-right: 5px;
      margin-bottom: 5px;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>