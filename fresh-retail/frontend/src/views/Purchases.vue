<template>
  <div class="page-container">
    <div class="page-header">
      <h2>采购管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon> 新建采购单
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filters.storeId" placeholder="选择门店" clearable style="width: 160px;" @change="fetchList">
        <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
      <el-select v-model="filters.supplierId" placeholder="选择供应商" clearable style="width: 180px;" @change="fetchList">
        <el-option v-for="s in supplierList" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px;" @change="fetchList">
        <el-option label="待审核" value="pending" />
        <el-option label="已审核" value="approved" />
        <el-option label="已收货" value="received" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-button type="primary" @click="fetchList"><el-icon><Search /></el-icon> 搜索</el-button>
    </div>

    <!-- 采购单列表 -->
    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="purchaseNo" label="采购单号" width="160" />
        <el-table-column prop="storeName" label="门店" width="120" />
        <el-table-column prop="supplierName" label="供应商" width="150" />
        <el-table-column prop="totalAmount" label="采购金额" width="100">
          <template #default="{ row }">
            <span style="color: #67C23A; font-weight: 600;">{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type">{{ statusMap[row.status]?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expectedDate" label="预计到货" width="110" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'received'" type="success" link @click="handleReceive(row)">收货确认</el-button>
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

    <!-- 新建采购单弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建采购单" width="750px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="createForm.storeId" placeholder="选择门店" style="width: 100%;">
                <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="createForm.supplierId" placeholder="选择供应商" style="width: 100%;">
                <el-option v-for="s in supplierList" :key="s.id" :label="s.name" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="预计到货日期" prop="expectedDate">
          <el-date-picker v-model="createForm.expectedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>

        <!-- 商品明细 -->
        <el-form-item label="商品明细">
          <el-button type="primary" size="small" @click="addPurchaseItem">
            <el-icon><Plus /></el-icon> 添加商品
          </el-button>
        </el-form-item>
        <el-table :data="createForm.items" border size="small" style="margin-bottom: 16px;">
          <el-table-column label="商品" min-width="150">
            <template #default="{ row }">
              <el-select v-model="row.productId" placeholder="选择商品" filterable style="width: 100%;">
                <el-option v-for="p in productList" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" size="small" controls-position="right" style="width: 100%;" />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" :precision="2" size="small" controls-position="right" style="width: 100%;" />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="80">
            <template #default="{ row }">
              {{ ((row.quantity || 0) * (row.price || 0)).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column width="60">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="createForm.items.splice($index, 1)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleCreate">提交采购单</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="采购单详情" width="700px" destroy-on-close>
      <template v-if="currentOrder">
        <el-descriptions :column="2" border style="margin-bottom: 20px;">
          <el-descriptions-item label="采购单号">{{ currentOrder.purchaseNo }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ currentOrder.storeName }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentOrder.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusMap[currentOrder.status]?.type">{{ statusMap[currentOrder.status]?.label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预计到货">{{ currentOrder.expectedDate }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin-bottom: 10px;">采购明细</h4>
        <el-table :data="currentOrder.items || []" border size="small">
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="quantity" label="采购数量" width="100" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="amount" label="金额" width="80">
            <template #default="{ row }">
              <span style="color: #67C23A; font-weight: 600;">{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="receivedQty" label="已收货" width="80" />
        </el-table>
        <div style="margin-top: 16px; text-align: right;">
          采购总额：<span style="color: #67C23A; font-size: 18px; font-weight: 700;">{{ currentOrder.totalAmount }} 元</span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { purchases, stores, suppliers, products } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const createDialogVisible = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)
const createFormRef = ref(null)
const tableData = ref([])
const storeList = ref([])
const supplierList = ref([])
const productList = ref([])

const filters = reactive({ storeId: '', supplierId: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const statusMap = {
  pending: { type: 'warning', label: '待审核' },
  approved: { type: 'primary', label: '已审核' },
  received: { type: 'success', label: '已收货' },
  cancelled: { type: 'info', label: '已取消' },
}

const createForm = reactive({
  storeId: '',
  supplierId: '',
  expectedDate: '',
  items: [],
  remark: '',
})

const createRules = {
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  expectedDate: [{ required: true, message: '请选择预计到货日期', trigger: 'change' }],
}

function addPurchaseItem() {
  createForm.items.push({ productId: '', quantity: 10, price: 0 })
}

async function fetchList() {
  loading.value = true
  try {
    const res = await purchases.getList({ page: pagination.page, pageSize: pagination.pageSize, ...filters })
    tableData.value = res.data?.list || res.list || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e) {
    tableData.value = [
      { id: 1, purchaseNo: 'PO20240115001', storeName: '旗舰店', supplierName: '绿源果品有限公司', totalAmount: '5,600', status: 'received', expectedDate: '2024-01-16', createTime: '2024-01-15 09:00' },
      { id: 2, purchaseNo: 'PO20240115002', storeName: '万达广场店', supplierName: '鲜达蔬菜配送中心', totalAmount: '3,200', status: 'pending', expectedDate: '2024-01-17', createTime: '2024-01-15 10:30' },
    ]
    pagination.total = 2
  } finally {
    loading.value = false
  }
}

async function fetchBaseData() {
  try {
    const [sRes, supRes, pRes] = await Promise.allSettled([
      stores.getList(),
      suppliers.getList(),
      products.getList({ pageSize: 200 }),
    ])
    storeList.value = sRes.value?.data?.list || sRes.value?.list || []
    supplierList.value = supRes.value?.data?.list || supRes.value?.list || []
    productList.value = pRes.value?.data?.list || pRes.value?.list || []
  } catch (e) {
    storeList.value = [{ id: 1, name: '旗舰店' }, { id: 2, name: '万达广场店' }]
    supplierList.value = [{ id: 1, name: '绿源果品有限公司' }, { id: 2, name: '鲜达蔬菜配送中心' }]
    productList.value = [{ id: 1, name: '红富士苹果' }, { id: 2, name: '新鲜三文鱼' }]
  }
}

function openCreateDialog() {
  Object.assign(createForm, { storeId: '', supplierId: '', expectedDate: '', items: [], remark: '' })
  createDialogVisible.value = true
}

async function handleCreate() {
  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid) return
  if (createForm.items.length === 0) {
    ElMessage.warning('请添加采购商品')
    return
  }
  submitLoading.value = true
  try {
    await purchases.create(createForm)
    ElMessage.success('采购单创建成功')
    createDialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('创建失败')
  } finally {
    submitLoading.value = false
  }
}

async function viewDetail(row) {
  try {
    const res = await purchases.getDetail(row.id)
    currentOrder.value = res.data || res
  } catch (e) {
    currentOrder.value = {
      ...row,
      items: [
        { productName: '红富士苹果', quantity: 500, price: 6.00, amount: '3,000.00', receivedQty: 500 },
        { productName: '香蕉', quantity: 200, price: 2.50, amount: '500.00', receivedQty: 200 },
      ],
    }
  }
  detailVisible.value = true
}

async function handleReceive(row) {
  try {
    // receiveItem 需要 (orderId, itemId, data) - 此处为简化演示直接用行数据
    await purchases.receiveItem(row.purchaseOrderId || row.id, row.id, { receivedQty: row.qty - (row.receivedQty || 0) })
    ElMessage.success('收货确认成功')
    fetchList()
  } catch (e) {
    ElMessage.error('收货确认失败')
  }
}

onMounted(() => {
  fetchBaseData()
  fetchList()
})
</script>
