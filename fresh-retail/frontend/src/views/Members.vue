<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会员管理</h2>
      <div>
        <el-button @click="$router.push('/members/levels')">
          <el-icon><Star /></el-icon> 等级管理
        </el-button>
        <el-button type="primary" @click="openDialog(null)">
          <el-icon><Plus /></el-icon> 新增会员
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="filter-bar">
      <el-input v-model="filters.keyword" placeholder="搜索姓名/手机号" clearable style="width: 220px;" @clear="fetchList" @keyup.enter="fetchList" />
      <el-button type="primary" @click="fetchList"><el-icon><Search /></el-icon> 搜索</el-button>
    </div>

    <!-- 会员列表 -->
    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="levelName" label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="row.levelName === '金卡' ? 'warning' : row.levelName === '钻石' ? 'success' : 'info'">
              {{ row.levelName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额(元)" width="100">
          <template #default="{ row }">
            <span style="color: #67C23A; font-weight: 600;">{{ row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" />
        <el-table-column prop="totalSpent" label="累计消费" width="100" />
        <el-table-column prop="orderCount" label="订单数" width="80" />
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="success" link @click="openRechargeDialog(row)">储值</el-button>
            <el-button type="warning" link @click="openPointsDialog(row)">积分</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingItem ? '编辑会员' : '新增会员'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="等级" prop="levelId">
          <el-select v-model="form.levelId" placeholder="请选择等级" style="width: 100%;">
            <el-option v-for="level in levelList" :key="level.id" :label="level.name" :value="level.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 储值弹窗 -->
    <el-dialog v-model="rechargeVisible" title="会员储值" width="400px" destroy-on-close>
      <el-form ref="rechargeFormRef" :model="rechargeForm" label-width="80px">
        <el-form-item label="当前余额">
          <span style="color: #67C23A; font-weight: 600;">{{ currentMember?.balance || 0 }} 元</span>
        </el-form-item>
        <el-form-item label="储值金额" required>
          <el-input-number v-model="rechargeForm.amount" :min="1" :precision="2" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleRecharge">确认储值</el-button>
      </template>
    </el-dialog>

    <!-- 积分调整弹窗 -->
    <el-dialog v-model="pointsVisible" title="积分调整" width="400px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="当前积分">
          <span style="font-weight: 600;">{{ currentMember?.points || 0 }}</span>
        </el-form-item>
        <el-form-item label="操作">
          <el-radio-group v-model="pointsForm.type">
            <el-radio value="add">增加积分</el-radio>
            <el-radio value="deduct">扣减积分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="积分数量" required>
          <el-input-number v-model="pointsForm.points" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="pointsForm.reason" type="textarea" :rows="2" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pointsVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handlePoints">确定</el-button>
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
const rechargeVisible = ref(false)
const pointsVisible = ref(false)
const editingItem = ref(null)
const currentMember = ref(null)
const formRef = ref(null)
const rechargeFormRef = ref(null)
const tableData = ref([])
const levelList = ref([])

const filters = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const form = reactive({ name: '', phone: '', levelId: '', remark: '' })
const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
}

const rechargeForm = reactive({ amount: 100 })
const pointsForm = reactive({ type: 'add', points: 100, reason: '' })

async function fetchList() {
  loading.value = true
  try {
    const res = await members.getList({ page: pagination.page, pageSize: pagination.pageSize, ...filters })
    tableData.value = res.data?.list || res.list || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e) {
    tableData.value = [
      { id: 1, name: '张三', phone: '13800138001', levelName: '金卡', balance: 1280.50, points: 3560, totalSpent: '12,580', orderCount: 86, createTime: '2023-06-15' },
      { id: 2, name: '李四', phone: '13800138002', levelName: '银卡', balance: 350.00, points: 1200, totalSpent: '5,230', orderCount: 32, createTime: '2023-08-20' },
      { id: 3, name: '王五', phone: '13800138003', levelName: '钻石', balance: 5680.00, points: 9800, totalSpent: '28,900', orderCount: 156, createTime: '2023-01-10' },
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

async function fetchLevels() {
  try {
    const res = await members.getLevels()
    levelList.value = res.data?.list || res.list || []
  } catch (e) {
    levelList.value = [
      { id: 1, name: '银卡' },
      { id: 2, name: '金卡' },
      { id: 3, name: '钻石' },
    ]
  }
}

function openDialog(row) {
  editingItem.value = row
  if (row) {
    Object.assign(form, { name: row.name, phone: row.phone, levelId: row.levelId, remark: row.remark })
  } else {
    Object.assign(form, { name: '', phone: '', levelId: '', remark: '' })
  }
  dialogVisible.value = true
}

function openRechargeDialog(row) {
  currentMember.value = row
  rechargeForm.amount = 100
  rechargeVisible.value = true
}

function openPointsDialog(row) {
  currentMember.value = row
  pointsForm.type = 'add'
  pointsForm.points = 100
  pointsForm.reason = ''
  pointsVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (editingItem.value) {
      await members.update(editingItem.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await members.create(form)
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

async function handleRecharge() {
  if (!rechargeForm.amount || rechargeForm.amount <= 0) {
    ElMessage.warning('请输入储值金额')
    return
  }
  submitLoading.value = true
  try {
    await members.recharge(currentMember.value.id, { amount: rechargeForm.amount })
    ElMessage.success('储值成功')
    rechargeVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('储值失败')
  } finally {
    submitLoading.value = false
  }
}

async function handlePoints() {
  if (!pointsForm.points || pointsForm.points <= 0) {
    ElMessage.warning('请输入积分数量')
    return
  }
  submitLoading.value = true
  try {
    const api = pointsForm.type === 'add' ? members.addPoints : members.deductPoints
    await api(currentMember.value.id, { points: pointsForm.points, reason: pointsForm.reason })
    ElMessage.success('积分调整成功')
    pointsVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('积分调整失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchLevels()
  fetchList()
})
</script>
