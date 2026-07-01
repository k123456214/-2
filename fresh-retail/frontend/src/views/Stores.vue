<template>
  <div class="page-container">
    <div class="page-header">
      <h2>门店管理</h2>
      <el-button type="primary" @click="openDialog(null)">
        <el-icon><Plus /></el-icon> 新增门店
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="name" label="门店名称" min-width="150" />
        <el-table-column prop="code" label="门店编码" width="120" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="manager" label="负责人" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '营业中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该门店吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingItem ? '编辑门店' : '新增门店'" width="550px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入门店名称" />
        </el-form-item>
        <el-form-item label="门店编码" prop="code">
          <el-input v-model="form.code" placeholder="如：STORE001" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入门店地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="form.manager" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">营业中</el-radio>
            <el-radio :value="0">已关闭</el-radio>
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
import { stores } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const editingItem = ref(null)
const formRef = ref(null)
const tableData = ref([])

const form = reactive({
  name: '', code: '', address: '', phone: '', manager: '', status: 1,
})

const formRules = {
  name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入门店编码', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res = await stores.getList()
    tableData.value = res.data?.list || res.list || []
  } catch (e) {
    tableData.value = [
      { id: 1, name: '旗舰店（中心店）', code: 'STORE001', address: '市中心商业广场A区1楼', phone: '021-12345678', manager: '赵经理', status: 1 },
      { id: 2, name: '万达广场店', code: 'STORE002', address: '万达广场B1层', phone: '021-23456789', manager: '钱经理', status: 1 },
      { id: 3, name: '社区生鲜店', code: 'STORE003', address: '幸福路168号', phone: '021-34567890', manager: '孙经理', status: 1 },
      { id: 4, name: '大学城店', code: 'STORE004', address: '大学城美食街3号', phone: '021-45678901', manager: '李经理', status: 1 },
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
    Object.assign(form, { name: '', code: '', address: '', phone: '', manager: '', status: 1 })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (editingItem.value) {
      await stores.update(editingItem.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await stores.create(form)
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
    await stores.remove(id)
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
