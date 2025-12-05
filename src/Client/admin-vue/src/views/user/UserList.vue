<!-- views/user/UserList.vue -->
<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd" v-permission="'user:add'">新增</el-button>
        </div>
      </template>
      <el-table :data="userList" border>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)" v-permission="'user:edit'">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)" v-permission="'user:delete'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUsers } from '@/api/modules/user'

const userList = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(() => {
  fetchUsers()
})

const fetchUsers = async () => {
  const res = await getUsers({ page: page.value, pageSize: pageSize.value })
  userList.value = res.data.users
  total.value = res.data.total
}

const handleCurrentChange = (val: number) => {
  page.value = val
  fetchUsers()
}

const handleAdd = () => {
  // 打开新增对话框
}

const handleEdit = (row: any) => {
  // 打开编辑对话框
}

const handleDelete = (row: any) => {
  // 删除用户
}
</script>