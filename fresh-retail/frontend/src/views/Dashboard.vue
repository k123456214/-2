<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <el-statistic :title="card.label" :value="card.value" :prefix="card.prefix" />
          <div class="stat-footer">
            <span :class="card.trend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="card.trend > 0"><Top /></el-icon>
              <el-icon v-else><Bottom /></el-icon>
              {{ Math.abs(card.trend) }}%
            </span>
            <span style="color: #909399; font-size: 12px;">较昨日</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>销售趋势（近7天）</span>
          </template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>品类销售占比</span>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>门店销售排名</span>
          </template>
          <el-table :data="storeRanking" stripe style="width: 100%">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="storeName" label="门店名称" />
            <el-table-column prop="salesAmount" label="销售额" width="120">
              <template #default="{ row }">
                <span style="color: #67C23A; font-weight: 600;">{{ row.salesAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderCount" label="订单数" width="80" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>热销商品排行</span>
          </template>
          <el-table :data="topProducts" stripe style="width: 100%">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="salesCount" label="销量" width="80" />
            <el-table-column prop="salesAmount" label="销售额" width="120">
              <template #default="{ row }">
                <span style="color: #67C23A; font-weight: 600;">{{ row.salesAmount }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const salesChartRef = ref(null)
const categoryChartRef = ref(null)
let salesChart = null
let categoryChart = null

// 统计卡片数据（模拟）
const statCards = ref([
  { label: '今日销售额', value: 12856.50, prefix: '¥', trend: 12.5 },
  { label: '今日订单数', value: 186, prefix: '', trend: 8.3 },
  { label: '库存预警数', value: 15, prefix: '', trend: -3.2 },
  { label: '新增会员数', value: 23, prefix: '', trend: 15.6 },
])

// 门店排名数据（模拟）
const storeRanking = ref([
  { storeName: '旗舰店（中心店）', salesAmount: '¥35,680', orderCount: 428 },
  { storeName: '万达广场店', salesAmount: '¥28,950', orderCount: 356 },
  { storeName: '社区生鲜店', salesAmount: '¥22,310', orderCount: 289 },
  { storeName: '大学城店', salesAmount: '¥18,750', orderCount: 234 },
  { storeName: '高铁站店', salesAmount: '¥15,200', orderCount: 198 },
])

// 热销商品数据（模拟）
const topProducts = ref([
  { productName: '有机红富士苹果', salesCount: 156, salesAmount: '¥4,680' },
  { productName: '新鲜三文鱼', salesCount: 89, salesAmount: '¥8,900' },
  { productName: '澳洲进口牛排', salesCount: 76, salesAmount: '¥7,600' },
  { productName: '有机蔬菜套餐', salesCount: 134, salesAmount: '¥4,020' },
  { productName: '智利车厘子', salesCount: 65, salesAmount: '¥5,850' },
])

function initSalesChart() {
  if (!salesChartRef.value) return
  salesChart = echarts.init(salesChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,194,58,0.4)' },
            { offset: 1, color: 'rgba(103,194,58,0.05)' },
          ]),
        },
        lineStyle: { color: '#67C23A', width: 2 },
        itemStyle: { color: '#67C23A' },
        data: [8200, 9500, 7800, 12100, 15600, 18900, 12856],
      },
    ],
  }
  salesChart.setOption(option)
}

function initCategoryChart() {
  if (!categoryChartRef.value) return
  categoryChart = echarts.init(categoryChartRef.value)
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'middle' },
    series: [
      {
        name: '品类销售',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: [
          { value: 35800, name: '水果' },
          { value: 28500, name: '蔬菜' },
          { value: 22300, name: '肉禽' },
          { value: 15600, name: '水产' },
          { value: 8900, name: '熟食' },
          { value: 5200, name: '其他' },
        ],
        color: ['#67C23A', '#85ce61', '#e6a23c', '#409eff', '#f56c6c', '#909399'],
      },
    ],
  }
  categoryChart.setOption(option)
}

function handleResize() {
  salesChart?.resize()
  categoryChart?.resize()
}

onMounted(async () => {
  await nextTick()
  initSalesChart()
  initCategoryChart()
  window.addEventListener('resize', handleResize)

  try {
    const { dashboard } = await import('../api')
    const res = await dashboard.getOverview()
    if (res.data) {
      statCards.value[0].value = res.data.todaySales ?? statCards.value[0].value
      statCards.value[1].value = res.data.todayOrders ?? statCards.value[1].value
      statCards.value[2].value = res.data.stockWarnings ?? statCards.value[2].value
      statCards.value[3].value = res.data.newMembers ?? statCards.value[3].value
    }
  } catch (e) {
    // 使用模拟数据
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salesChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
.stat-card {
  text-align: center;
}

.stat-footer {
  margin-top: 8px;
  font-size: 12px;
}

.trend-up {
  color: #67C23A;
  margin-right: 4px;
}

.trend-down {
  color: #f56c6c;
  margin-right: 4px;
}

.chart-container {
  width: 100%;
  height: 350px;
}
</style>
