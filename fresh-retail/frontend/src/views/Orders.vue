<template>
  <div class="page-container">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px;"
        @change="fetchList"
      />
      <el-select v-model="filters.storeId" placeholder="选择门店" clearable style="width: 160px;" @change="fetchList">
        <el-option v-for="s in storeList" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
      <el-select v-model="filters.status" placeholder="订单状态" clearable style="width: 120px;" @change="fetchList">
        <el-option label="待支付" value="pending" />
        <el-option label="已完成" value="completed" />
        <el-option label="已退款" value="refunded" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-input v-model="filters.orderNo" placeholder="订单号搜索" clearable style="width: 200px;" @clear="fetchList" @keyup.enter="fetchList" />
      <el-button type="primary" @click="fetchList"><el-icon><Search /></el-icon> 搜索</el-button>
    </div>

    <!-- 订单列表 -->
    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="storeName" label="门店" width="120" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600;">{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="90" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">{{ statusMap[row.status]?.label || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberName" label="会员" width="100" />
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="700px" destroy-on-close>
      <template v-if="currentOrder">
        <el-descriptions :column="2" border style="margin-bottom: 20px;">
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ currentOrder.storeName }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ currentOrder.payMethod }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusMap[currentOrder.status]?.type">{{ statusMap[currentOrder.status]?.label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="会员">{{ currentOrder.memberName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin-bottom: 10px;">商品明细</h4>
        <el-table :data="currentOrder.items || []" border size="small">
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="price" label="单价" width="80" />
          <el-table-column prop="quantity" label="数量" width="60" />
          <el-table-column prop="weight" label="重量" width="60" />
          <el-table-column prop="subtotal" label="小计" width="80">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: 600;">{{ row.subtotal }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 16px; text-align: right; font-size: 16px;">
          合计：<span style="color: #f56c6c; font-size: 20px; font-weight: 700;">{{ currentOrder.totalAmount }} 元</span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { orders, stores } from '../api'

const loading = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)
const tableData = ref([])
const storeList = ref([])

const filters = reactive({
  dateRange: [],
  storeId: '',
  status: '',
  orderNo: '',
})

const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const statusMap = {
  pending: { type: 'warning', label: '待支付' },
  completed: { type: 'success', label: '已完成' },
  refunded: { type: 'danger', label: '已退款' },
  cancelled: { type: 'info', label: '已取消' },
}

async function fetchList() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
    }
    if (filters.dateRange?.length === 2) {
      params.startDate = filters.dateRange[0]
      params.endDate = filters.dateRange[1]
    }
    delete params.dateRange
    const res = await orders.getList(params)
    tableData.value = res.data?.list || res.list || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e) {
    tableData.value = [
      { orderNo: 'ORD20240115001', storeName: '旗舰店', totalAmount: '156.80', payMethod: '微信', status: 'completed', memberName: '张三', createTime: '2024-01-15 10:30:00' },
      { orderNo: 'ORD20240115002', storeName: '万达广场店', totalAmount: '89.50', payMethod: '现金', status: 'completed', memberName: '-', createTime: '2024-01-15 11:20:00' },
      { orderNo: 'ORD20240115003', storeName: '旗舰店', totalAmount: '234.00', payMethod: '支付宝', status: 'pending', memberName: '李四', createTime: '2024-01-15 12:15:00' },
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

async function viewDetail(row) {
  try {
    const res = await orders.getDetail(row.id)
    currentOrder.value = res.data || res
  } catch (e) {
    currentOrder.value = {
      ...row,
      items: [
        { name: '有机红富士苹果', price: 8.90, quantity: 3, weight: 3, subtotal: 26.70 },
        { name: '新鲜三文鱼', price: 68.00, quantity: 1, weight: 1.5, subtotal: 102.00 },
        { name: '有机蔬菜套餐', price: 29.90, quantity: 1, weight: 0, subtotal: 29.90 },
      ],
    }
  }
  detailVisible.value = true
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

onMounted(() => {
  fetchStores()
  fetchList()
})
</script>
