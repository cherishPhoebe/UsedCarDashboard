<!-- views/layout/Layout.vue -->
<template>
  <div class="layout">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          router
        >
          <el-menu-item index="/users" v-permission="'user:view'">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/roles" v-permission="'role:view'">
            <i class="el-icon-s-custom"></i>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/permissions" v-permission="'permission:view'">
            <i class="el-icon-lock"></i>
            <span>权限管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-right">
            <span>{{ userStore.userInfo.username }}</span>
            <el-button @click="logout">退出</el-button>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const logout = () => {
  userStore.logout()
}
</script>