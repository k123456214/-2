<template>
  <div class="page-container">
    <div class="page-header">
      <h2>库存管理</h2>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filters.storeId" placeholder="选择门店" clearable style="width: 160px;" @change="fetchList">
        <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
      <el-input v-model="filters.keyword" placeholder="搜索商品名称" clearable style="width: 200px;" @clear="fetchList" @keyup.enter="fetchList" />
      <el-button type="primary" @click="fetchList"><el-icon><Search /></el-icon> 搜索</el-button>
    </div>

    <!-- Tab切换 -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部库存" name="all" />
        <el-tab-pane label="库存预警" name="warning">
          <template #label>
            库存预警 <el-badge :value="warningCount" :max="99" type="danger" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="库存调拨" name="transfer" />
      </el-tabs>

      <!-- 全部库存 / 库存预警 -->
      <div v-if="activeTab !== 'transfer'">
        <el-table :data="tableData" stripe v-loading="loading" border>
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column prop="storeName" label="门店" width="120" />
          <el-table-column prop="stock" label="当前库存" width="100">
            <template #default="{ row }">
              <span :style="{ color: row.stock <= row.stockWarning ? '#f56c6c' : '#67C23A', fontWeight: 600 }">
                {{ row.stock }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="stockWarning" label="预警值" width="80" />
          <el-table-column prop="unit" label="单位" width="60" />
          <el-table-column prop="lastUpdateTime" label="最后更新" width="160" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openAdjustDialog(row)">库存调整</el-button>
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

      <!-- 库存调拨 -->
      <div v-else>
        <div style="margin-bottom: 16px;">
          <el-button type="primary" @click="openTransferDialog">
            <el-icon><Sort /></el-icon> 新建调拨
          </el-button>
        </div>
        <el-table :data="transferList" stripe border>
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column prop="fromStoreName" label="调出门店" width="120" />
          <el-table-column prop="toStoreName" label="调入门店" width="120" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusMap[row.status]?.type">{{ statusMap[row.status]?.label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="申请时间" width="160" />
        </el-table>
      </div>
    </el-card>

    <!-- 库存调整弹窗 -->
    <el-dialog v-model="adjustDialogVisible" title="库存调整" width="500px" destroy-on-close>
      <el-form ref="adjustFormRef" :model="adjustForm" :rules="adjustRules" label-width="90px">
        <el-form-item label="商品">
          <el-input :value="adjustForm.productName" disabled />
        </el-form-item>
        <el-form-item label="调整类型" prop="type">
          <el-radio-group v-model="adjustForm.type">
            <el-radio value="in">入库</el-radio>
            <el-radio value="out">出库</el-radio>
            <el-radio value="check">盘点</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="quantity">
          <el-input-number v-model="adjustForm.quantity" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="adjustForm.remark" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleAdjust">确定</el-button>
      </template>
    </el-dialog>

    <!-- 跨店调拨弹窗 -->
    <el-dialog v-model="transferDialogVisible" title="跨店调拨" width="550px" destroy-on-close>
      <el-form ref="transferFormRef" :model="transferForm" :rules="transferRules" label-width="90px">
        <el-form-item label="商品" prop="productId">
          <el-select v-model="transferForm.productId" placeholder="选择商品" filterable style="width: 100%;">
            <el-option v-for="p in productList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调出门店" prop="fromStoreId">
          <el-select v-model="transferForm.fromStoreId" placeholder="选择调出门店" style="width: 100%;">
            <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调入门店" prop="toStoreId">
          <el-select v-model="transferForm.toStoreId" placeholder="选择调入门店" style="width: 100%;">
            <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨数量" prop="quantity">
          <el-input-number v-model="transferForm.quantity" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="transferForm.remark" type="textarea" :rows="3" placeholder="请输入调拨原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleTransfer">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { stocks, products, stores } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const activeTab = ref('all')
const tableData = ref([])
const transferList = ref([])
const storeList = ref([])
const productList = ref([])
const warningCount = ref(0)

const filters = reactive({ storeId: '', keyword: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const statusMap = {
  pending: { type: 'warning', label: '待审核' },
  approved: { type: 'success', label: '已通过' },
  rejected: { type: 'danger', label: '已驳回' },
  completed: { type: 'info', label: '已完成' },
}

const adjustDialogVisible = ref(false)
const adjustFormRef = ref(null)
const adjustForm = reactive({
  productId: null,
  productName: '',
  storeId: '',
  type: 'in',
  quantity: 0,
  remark: '',
})
const adjustRules = {
  type: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入调整数量', trigger: 'blur' }],
}

const transferDialogVisible = ref(false)
const transferFormRef = ref(null)
const transferForm = reactive({
  productId: '',
  fromStoreId: '',
  toStoreId: '',
  quantity: 1,
  remark: '',
})
const transferRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  fromStoreId: [{ required: true, message: '请选择调出门店', trigger: 'change' }],
  toStoreId: [{ required: true, message: '请选择调入门店', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入调拨数量', trigger: 'blur' }],
}

function handleTabChange() {
  if (activeTab.value === 'transfer') {
    fetchTransferList()
  } else {
    fetchList()
  }
}

async function fetchList() {
  loading.value = true
  try {
    const api = activeTab.value === 'warning' ? stocks.getWarnings : stocks.getList
    const res = await api({ page: pagination.page, pageSize: pagination.pageSize, ...filters })
    tableData.value = res.data?.list || res.list || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e) {
    tableData.value = [
      { id: 1, productName: '有机红富士苹果', storeName: '旗舰店', stock: 8, stockWarning: 10, unit: '斤', lastUpdateTime: '2024-01-15 10:30' },
      { id: 2, productName: '新鲜三文鱼', storeName: '旗舰店', stock: 5, stockWarning: 10, unit: '斤', lastUpdateTime: '2024-01-15 10:30' },
      { id: 3, productName: '智利车厘子', storeName: '万达广场店', stock: 3, stockWarning: 10, unit: '斤', lastUpdateTime: '2024-01-15 10:30' },
    ]
    pagination.total = 3
    warningCount.value = 3
  } finally {
    loading.value = false
  }
}

async function fetchTransferList() {
  try {
    const res = await stocks.getHistory({ type: 'transfer' })
    transferList.value = res.data?.list || res.list || []
  } catch (e) {
    transferList.value = [
      { productName: '有机红富士苹果', fromStoreName: '旗舰店', toStoreName: '万达广场店', quantity: 50, status: 'pending', createTime: '2024-01-14 15:30' },
    ]
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
      { id: 3, name: '社区生鲜店' },
    ]
  }
}

async function fetchProducts() {
  try {
    const res = await products.getList({ pageSize: 100 })
    productList.value = res.data?.list || res.list || []
  } catch (e) {
    productList.value = [
      { id: 1, name: '有机红富士苹果' },
      { id: 2, name: '新鲜三文鱼' },
    ]
  }
}

function openAdjustDialog(row) {
  Object.assign(adjustForm, {
    productId: row.productId || row.id,
    productName: row.productName,
    storeId: row.storeId,
    type: 'in',
    quantity: 0,
    remark: '',
  })
  adjustDialogVisible.value = true
}

function openTransferDialog() {
  Object.assign(transferForm, { productId: '', fromStoreId: '', toStoreId: '', quantity: 1, remark: '' })
  transferDialogVisible.value = true
}

async function handleAdjust() {
  const valid = await adjustFormRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    await stocks.adjust(adjustForm)
    ElMessage.success('库存调整成功')
    adjustDialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('库存调整失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleTransfer() {
  const valid = await transferFormRef.value.validate().catch(() => false)
  if (!valid) return
  if (transferForm.fromStoreId === transferForm.toStoreId) {
    ElMessage.warning('调出门店和调入门店不能相同')
    return
  }
  submitLoading.value = true
  try {
    await stocks.transfer(transferForm)
    ElMessage.success('调拨申请已提交')
    transferDialogVisible.value = false
    fetchTransferList()
  } catch (e) {
    ElMessage.error('调拨申请失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchStores()
  fetchProducts()
  fetchList()
})
</script>
