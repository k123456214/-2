<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会员等级管理</h2>
      <div>
        <el-button @click="$router.push('/members')">
          <el-icon><ArrowLeft /></el-icon> 返回会员管理
        </el-button>
        <el-button type="primary" @click="openDialog(null)">
          <el-icon><Plus /></el-icon> 新增等级
        </el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="name" label="等级名称" width="120" />
        <el-table-column prop="minPoints" label="最低积分" width="100" />
        <el-table-column prop="discount" label="折扣" width="100">
          <template #default="{ row }">
            <span style="color: #67C23A; font-weight: 600;">{{ (row.discount * 100).toFixed(0) }}折</span>
          </template>
        </el-table-column>
        <el-table-column prop="pointsRate" label="积分比例" width="100">
          <template #default="{ row }">
            消费1元得{{ row.pointsRate }}积分
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="会员数" width="80" />
        <el-table-column prop="benefits" label="权益说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该等级吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingItem ? '编辑等级' : '新增等级'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="如：银卡、金卡、钻石" />
        </el-form-item>
        <el-form-item label="最低积分" prop="minPoints">
          <el-input-number v-model="form.minPoints" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="折扣" prop="discount">
          <el-input-number v-model="form.discount" :min="0.5" :max="1" :precision="2" :step="0.05" style="width: 100%;" />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">0.95表示95折</div>
        </el-form-item>
        <el-form-item label="积分比例" prop="pointsRate">
          <el-input-number v-model="form.pointsRate" :min="0" :max="100" style="width: 100%;" />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">消费1元获得多少积分</div>
        </el-form-item>
        <el-form-item label="权益说明">
          <el-input v-model="form.benefits" type="textarea" :rows="3" placeholder="请输入该等级的权益说明" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%;" />
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
import { members } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const editingItem = ref(null)
const formRef = ref(null)
const tableData = ref([])

const form = reactive({
  name: '',
  minPoints: 0,
  discount: 1.0,
  pointsRate: 1,
  benefits: '',
  sort: 0,
})

const formRules = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  discount: [{ required: true, message: '请输入折扣', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res = await members.getLevels()
    tableData.value = res.data?.list || res.list || []
  } catch (e) {
    tableData.value = [
      { id: 1, name: '银卡', minPoints: 0, discount: 0.98, pointsRate: 1, memberCount: 156, benefits: '消费98折，生日礼品', sort: 1 },
      { id: 2, name: '金卡', minPoints: 3000, discount: 0.95, pointsRate: 2, memberCount: 68, benefits: '消费95折，优先配送，专属客服', sort: 2 },
      { id: 3, name: '钻石', minPoints: 10000, discount: 0.90, pointsRate: 3, memberCount: 12, benefits: '消费9折，免费配送，VIP专属活动', sort: 3 },
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
    Object.assign(form, { name: '', minPoints: 0, discount: 1.0, pointsRate: 1, benefits: '', sort: 0 })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (editingItem.value) {
      await members.updateLevel(editingItem.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await members.createLevel(form)
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
    await members.updateLevel(id, { ...form, deleted: true })
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
