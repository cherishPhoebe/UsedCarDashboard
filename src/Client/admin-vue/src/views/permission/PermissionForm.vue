<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :before-close="handleClose"
    append-to-body
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="permission-form"
    >
      <!-- 基本信息 -->
      <el-divider>基本信息</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="权限名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入权限名称"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限编码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入权限编码"
              clearable
            >
              <template #prepend>
                <el-select v-model="formData.module" placeholder="模块" style="width: 100px">
                  <el-option label="系统管理" value="system" />
                  <el-option label="用户管理" value="user" />
                  <el-option label="角色管理" value="role" />
                  <el-option label="权限管理" value="permission" />
                  <el-option label="仪表盘" value="dashboard" />
                  <el-option label="个人中心" value="profile" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="权限类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio :label="1">菜单权限</el-radio>
              <el-radio :label="2">按钮权限</el-radio>
              <el-radio :label="3">接口权限</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="formData.sort"
              :min="0"
              :max="999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="父级权限" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="permissionTree"
          :props="{ label: 'name', value: 'id' }"
          placeholder="请选择父级权限"
          clearable
          filterable
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
        <div class="form-tip" v-if="parentPermission">
          当前父级权限: {{ parentPermission.name }}
        </div>
      </el-form-item>

      <!-- 菜单权限配置 -->
      <el-collapse-transition>
        <div v-show="formData.type === 1">
          <el-divider>菜单配置</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="路由路径" prop="path">
                <el-input
                  v-model="formData.path"
                  placeholder="请输入路由路径"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="组件路径" prop="component">
                <el-input
                  v-model="formData.component"
                  placeholder="请输入组件路径"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="图标" prop="icon">
                <el-input
                  v-model="formData.icon"
                  placeholder="请输入图标名称"
                  clearable
                >
                  <template #append>
                    <el-button @click="showIconSelector = true">
                      选择图标
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="重定向" prop="redirect">
                <el-input
                  v-model="formData.redirect"
                  placeholder="请输入重定向路径"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-collapse-transition>

      <!-- 接口权限配置 -->
      <el-collapse-transition>
        <div v-show="formData.type === 3">
          <el-divider>接口配置</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="请求方法" prop="method">
                <el-select
                  v-model="formData.method"
                  placeholder="请选择请求方法"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="DELETE" value="DELETE" />
                  <el-option label="PATCH" value="PATCH" />
                  <el-option label="OPTIONS" value="OPTIONS" />
                  <el-option label="HEAD" value="HEAD" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="接口路径" prop="apiPath">
                <el-input
                  v-model="formData.apiPath"
                  placeholder="请输入接口路径"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-collapse-transition>

      <!-- 其他配置 -->
      <el-divider>其他配置</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否可见" prop="isVisible">
            <el-switch
              v-model="formData.isVisible"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否系统" prop="isSystem">
            <el-switch
              v-model="formData.isSystem"
              :active-value="true"
              :inactive-value="false"
              :disabled="!!currentRow?.isSystem"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="权限描述" prop="description">
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
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        确定
      </el-button>
    </template>

    <!-- 图标选择器 -->
    <IconSelector
      v-model="showIconSelector"
      v-model:selected-icon="formData.icon"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { permissionApi } from '@/api/modules/permission'
import type { Permission, PermissionTree } from '@/types/api'
import IconSelector from '@/components/business/IconSelector.vue'

interface Props {
  modelValue: boolean
  currentRow: Permission | null
  parentPermission?: Permission | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentRow: null,
  parentPermission: null
})

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// UI状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showIconSelector = ref(false)
const submitting = ref(false)

// 权限树数据
const permissionTree = ref<PermissionTree[]>([])

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  type: 1,
  parentId: '',
  module: 'system',
  sort: 0,
  path: '',
  component: '',
  icon: '',
  redirect: '',
  method: '',
  apiPath: '',
  isVisible: true,
  isSystem: false,
  description: ''
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z]+:[a-zA-Z]+(:[a-zA-Z]+)*$/, message: '格式如：system:user:view', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序值必须在 0-999 之间', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' },
    { pattern: /^\/[a-zA-Z0-9/-]*$/, message: '路径必须以/开头', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  if (props.currentRow?.id) {
    return '编辑权限'
  }
  return props.parentPermission ? `添加子权限 - ${props.parentPermission.name}` : '新增权限'
})

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const { data } = await permissionApi.getTree()
    permissionTree.value = data
  } catch (error) {
    console.error('获取权限树失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.keys(formData).forEach(key => {
    formData[key] = '' as any
  })
  formData.type = 1
  formData.sort = 0
  formData.isVisible = true
  formData.isSystem = false
  formData.module = 'system'
}

// 初始化表单数据
const initFormData = () => {
  resetForm()

  if (props.currentRow) {
    // 编辑模式
    Object.assign(formData, props.currentRow)
  } else if (props.parentPermission) {
    // 添加子权限模式
    formData.parentId = props.parentPermission.id
    // 如果是菜单权限，可以根据父级权限设置默认值
    if (props.parentPermission.type === 1) {
      formData.type = 1
      // 可以在这里设置一些默认值
    }
  } else {
    // 新增权限模式
    formData.parentId = ''
  }
}

// 处理关闭
const handleClose = () => {
  if (submitting.value) return

  dialogVisible.value = false
  resetForm()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 构建提交数据
    const submitData: any = { ...formData }

    // 根据权限类型清理不必要的字段
    if (submitData.type !== 1) {
      // 非菜单权限不需要这些字段
      delete submitData.path
      delete submitData.component
      delete submitData.icon
      delete submitData.redirect
    }

    if (submitData.type !== 3) {
      // 非接口权限不需要这些字段
      delete submitData.method
      delete submitData.apiPath
    }

    // 移除空值
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === undefined) {
        delete submitData[key]
      }
    })

    if (props.currentRow?.id) {
      // 更新权限
      await permissionApi.update(props.currentRow.id, submitData)
      ElMessage.success('权限更新成功')
    } else {
      // 新增权限
      await permissionApi.create(submitData)
      ElMessage.success('权限创建成功')
    }

    // 触发成功事件
    emit('success')
    handleClose()

  } catch (error) {
    console.error('保存权限失败:', error)
  } finally {
    submitting.value = false
  }
}

// 监听对话框显示状态
watch(dialogVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      initFormData()
    })
  }
})

// 初始化
onMounted(() => {
  fetchPermissionTree()
})
</script>

<style lang="scss" scoped>
.permission-form {
  .el-divider {
    margin: 20px 0;
  }

  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }

  :deep(.el-input-group__prepend) {
    background-color: #fff;
  }
}
</style>