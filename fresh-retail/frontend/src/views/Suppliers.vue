<template>
  <div class="page-container">
    <div class="page-header">
      <h2>供应商管理</h2>
      <el-button type="primary" @click="openDialog(null)">
        <el-icon><Plus /></el-icon> 新增供应商
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="name" label="供应商名称" min-width="150" />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="供应品类" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '合作中' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该供应商吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingItem ? '编辑供应商' : '新增供应商'" width="550px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="供应品类" prop="category">
          <el-input v-model="form.category" placeholder="如：水果、蔬菜、肉禽" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">合作中</el-radio>
            <el-radio :value="0">已停用</el-radio>
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
import { suppliers } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const editingItem = ref(null)
const formRef = ref(null)
const tableData = ref([])

const form = reactive({
  name: '', contactPerson: '', phone: '', address: '', category: '', status: 1,
})

const formRules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res = await suppliers.getList()
    tableData.value = res.data?.list || res.list || []
  } catch (e) {
    tableData.value = [
      { id: 1, name: '绿源果品有限公司', contactPerson: '刘总', phone: '021-55555555', address: '市郊水果批发市场A区', category: '水果', status: 1 },
      { id: 2, name: '鲜达蔬菜配送中心', contactPerson: '陈经理', phone: '021-66666666', address: '蔬菜批发基地B栋', category: '蔬菜', status: 1 },
      { id: 3, name: '恒大海鲜有限公司', contactPerson: '王总', phone: '021-77777777', address: '海鲜市场3号', category: '水产', status: 1 },
      { id: 4, name: '金锣肉业集团', contactPerson: '张经理', phone: '021-88888888', address: '肉类加工园区D座', category: '肉禽', status: 1 },
    ]
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  editingItem.value = row
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, { name: '', contactPerson: '', phone: '', address: '', category: '', status: 1 })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (editingItem.value) {
      await suppliers.update(editingItem.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await suppliers.create(form)
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
    await suppliers.remove(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>
