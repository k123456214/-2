<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="openDialog(null)">
        <el-icon><Plus /></el-icon> 新增用户
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleMap[row.role]?.type">{{ roleMap[row.role]?.label || row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="所属门店" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="warning" link @click="handleResetPwd(row)">重置密码</el-button>
            <el-popconfirm title="确定删除该用户吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingItem ? '编辑用户' : '新增用户'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!editingItem" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item v-if="!editingItem" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="超级管理员" value="admin" />
            <el-option label="店长" value="manager" />
            <el-option label="收银员" value="cashier" />
            <el-option label="采购员" value="buyer" />
            <el-option label="仓管员" value="warehouse" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属门店" prop="storeId">
          <el-select v-model="form.storeId" placeholder="请选择门店" clearable style="width: 100%;">
            <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { auth, stores } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const editingItem = ref(null)
const formRef = ref(null)
const tableData = ref([])
const storeList = ref([])

const form = reactive({
  username: '',
  name: '',
  phone: '',
  password: '',
  role: 'cashier',
  storeId: '',
  status: 1,
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const roleMap = {
  admin: { type: 'danger', label: '超级管理员' },
  manager: { type: 'warning', label: '店长' },
  cashier: { type: 'success', label: '收银员' },
  buyer: { type: 'primary', label: '采购员' },
  warehouse: { type: 'info', label: '仓管员' },
}

async function fetchList() {
  loading.value = true
  try {
    const res = await auth.getUsers()
    tableData.value = res.data?.list || res.list || []
  } catch (e) {
    tableData.value = [
      { id: 1, username: 'admin', name: '系统管理员', phone: '13800000001', role: 'admin', storeName: '全部', status: 1, lastLoginTime: '2024-01-15 08:30' },
      { id: 2, username: 'manager01', name: '赵经理', phone: '13800000002', role: 'manager', storeName: '旗舰店', status: 1, lastLoginTime: '2024-01-15 09:00' },
      { id: 3, username: 'cashier01', name: '小李', phone: '13800000003', role: 'cashier', storeName: '旗舰店', status: 1, lastLoginTime: '2024-01-15 10:00' },
      { id: 4, username: 'buyer01', name: '小王', phone: '13800000004', role: 'buyer', storeName: '旗舰店', status: 1, lastLoginTime: '2024-01-14 16:30' },
    ]
  } finally {
    loading.value = false
  }
}

async function fetchStores() {
  try {
    const res = await stores.getList()
    storeList.value = res.data?.list || res.list || []
  } catch (e) {
    storeList.value = [
      { id: 1, name: '旗舰店' },
      { id: 2, name: '万达广场店' },
    ]
  }
}

function openDialog(row) {
  editingItem.value = row
  if (row) {
    Object.assign(form, { username: row.username, name: row.name, phone: row.phone, role: row.role, storeId: row.storeId, status: row.status, password: '' })
  } else {
    Object.assign(form, { username: '', name: '', phone: '', password: '', role: 'cashier', storeId: '', status: 1 })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (editingItem.value) {
      await auth.updateUser(editingItem.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await auth.createUser(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(id) {
  try {
    await auth.deleteUser(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

async function handleResetPwd(row) {
  try {
    await auth.updateUser(row.id, { password: '123456' })
    ElMessage.success('密码已重置为 123456')
  } catch (e) {
    ElMessage.error('重置失败')
  }
}

onMounted(() => {
  fetchStores()
  fetchList()
})
</script>
