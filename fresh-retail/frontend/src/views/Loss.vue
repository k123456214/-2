<template>
  <div class="page-container">
    <div class="page-header">
      <h2>损耗管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon> 新建报损申请
      </el-button>
    </div>

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="损耗记录" name="records" />
        <el-tab-pane label="损耗统计" name="statistics" />
      </el-tabs>

      <!-- 损耗记录 -->
      <div v-if="activeTab === 'records'">
        <el-table :data="tableData" stripe v-loading="loading" border>
          <el-table-column prop="lossNo" label="报损单号" width="160" />
          <el-table-column prop="storeName" label="门店" width="120" />
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column prop="quantity" label="损耗数量" width="80" />
          <el-table-column prop="amount" label="损耗金额" width="100">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: 600;">{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="损耗原因" width="100" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="statusMap[row.status]?.type">{{ statusMap[row.status]?.label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="applicant" label="申请人" width="80" />
          <el-table-column prop="createTime" label="申请时间" width="160" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'pending'">
                <el-button type="success" link @click="handleApprove(row)">通过</el-button>
                <el-button type="danger" link @click="handleReject(row)">驳回</el-button>
              </template>
              <span v-else style="color: #909399; font-size: 12px;">已处理</span>
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
      </div>

      <!-- 损耗统计 -->
      <div v-if="activeTab === 'statistics'">
        <el-row :gutter="20">
          <el-col :span="12">
            <h4 style="margin-bottom: 12px;">损耗原因分布</h4>
            <div ref="reasonChartRef" style="height: 350px;"></div>
          </el-col>
          <el-col :span="12">
            <h4 style="margin-bottom: 12px;">各品类损耗金额</h4>
            <div ref="categoryChartRef" style="height: 350px;"></div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 新建报损弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建报损申请" width="500px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-form-item label="门店" prop="storeId">
          <el-select v-model="createForm.storeId" placeholder="选择门店" style="width: 100%;">
            <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品" prop="productId">
          <el-select v-model="createForm.productId" placeholder="选择商品" filterable style="width: 100%;">
            <el-option v-for="p in productList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="损耗数量" prop="quantity">
          <el-input-number v-model="createForm.quantity" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="损耗金额" prop="amount">
          <el-input-number v-model="createForm.amount" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="损耗原因" prop="reason">
          <el-select v-model="createForm.reason" placeholder="选择原因" style="width: 100%;">
            <el-option label="过期变质" value="过期变质" />
            <el-option label="运输损耗" value="运输损耗" />
            <el-option label="陈列损耗" value="陈列损耗" />
            <el-option label="人为损耗" value="人为损耗" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入详细说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleCreate">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { loss, stores, products } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const activeTab = ref('records')
const createDialogVisible = ref(false)
const createFormRef = ref(null)
const tableData = ref([])
const storeList = ref([])
const productList = ref([])

const reasonChartRef = ref(null)
const categoryChartRef = ref(null)
let reasonChart = null
let categoryChart = null

const filters = reactive({})
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const statusMap = {
  pending: { type: 'warning', label: '待审批' },
  approved: { type: 'success', label: '已通过' },
  rejected: { type: 'danger', label: '已驳回' },
}

const createForm = reactive({
  storeId: '',
  productId: '',
  quantity: 1,
  amount: 0,
  reason: '',
  remark: '',
})

const createRules = {
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入损耗数量', trigger: 'blur' }],
  reason: [{ required: true, message: '请选择损耗原因', trigger: 'change' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res = await loss.getList({ page: pagination.page, pageSize: pagination.pageSize, ...filters })
    tableData.value = res.data?.list || res.list || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e) {
    tableData.value = [
      { id: 1, lossNo: 'LOSS20240115001', storeName: '旗舰店', productName: '红富士苹果', quantity: 15, amount: '133.50', reason: '过期变质', status: 'pending', applicant: '小李', createTime: '2024-01-15 10:00' },
      { id: 2, lossNo: 'LOSS20240115002', storeName: '万达广场店', productName: '大白菜', quantity: 20, amount: '39.60', reason: '运输损耗', status: 'approved', applicant: '小王', createTime: '2024-01-14 16:30' },
      { id: 3, lossNo: 'LOSS20240115003', storeName: '旗舰店', productName: '鲜牛奶', quantity: 8, amount: '96.00', reason: '过期变质', status: 'approved', applicant: '小李', createTime: '2024-01-14 09:15' },
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

async function fetchBaseData() {
  try {
    const [sRes, pRes] = await Promise.allSettled([stores.getList(), products.getList({ pageSize: 200 })])
    storeList.value = sRes.value?.data?.list || sRes.value?.list || []
    productList.value = pRes.value?.data?.list || pRes.value?.list || []
  } catch (e) {
    storeList.value = [{ id: 1, name: '旗舰店' }, { id: 2, name: '万达广场店' }]
    productList.value = [{ id: 1, name: '红富士苹果' }, { id: 2, name: '大白菜' }]
  }
}

function openCreateDialog() {
  Object.assign(createForm, { storeId: '', productId: '', quantity: 1, amount: 0, reason: '', remark: '' })
  createDialogVisible.value = true
}

async function handleCreate() {
  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    await loss.create(createForm)
    ElMessage.success('报损申请已提交')
    createDialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm('确认通过该报损申请？', '审批确认', { type: 'warning' })
    await loss.approve(row.id)
    ElMessage.success('审批通过')
    fetchList()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

async function handleReject(row) {
  try {
    await ElMessageBox.prompt('请输入驳回原因', '驳回报损', { inputPlaceholder: '驳回原因' })
      .then(async ({ value }) => {
        await loss.reject(row.id)
        ElMessage.success('已驳回')
        fetchList()
      })
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

function initCharts() {
  if (!reasonChartRef.value || !categoryChartRef.value) return

  // 原因饼图
  reasonChart = echarts.init(reasonChartRef.value)
  reasonChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['30%', '65%'],
      data: [
        { value: 4500, name: '过期变质' },
        { value: 2800, name: '运输损耗' },
        { value: 1200, name: '陈列损耗' },
        { value: 600, name: '人为损耗' },
        { value: 300, name: '其他' },
      ],
      color: ['#f56c6c', '#e6a23c', '#409eff', '#67C23A', '#909399'],
    }],
  })

  // 品类柱状图
  categoryChart = echarts.init(categoryChartRef.value)
  categoryChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['水果', '蔬菜', '肉禽', '水产', '熟食', '其他'] },
    yAxis: { type: 'value', name: '金额(元)' },
    series: [{
      type: 'bar',
      data: [3200, 1800, 2400, 1500, 600, 900],
      itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] },
    }],
  })
}

watch(activeTab, async (val) => {
  if (val === 'statistics') {
    await nextTick()
    initCharts()
  }
})

onMounted(() => {
  fetchBaseData()
  fetchList()
})

onUnmounted(() => {
  reasonChart?.dispose()
  categoryChart?.dispose()
})
</script>
