<template>
  <div class="page-container" style="padding: 0;">
    <div class="cashier-container">
      <!-- 左侧：商品选择 -->
      <div class="cashier-left">
        <div class="page-header" style="margin-bottom: 12px;">
          <h2 style="font-size: 18px;">商品选择</h2>
          <el-input v-model="searchKeyword" placeholder="搜索商品名称/条码" clearable style="width: 200px;" @clear="searchProduct" @keyup.enter="searchProduct">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <!-- 分类快捷标签 -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
          <el-tag
            v-for="cat in categories"
            :key="cat.id"
            :type="activeCategory === cat.id ? 'success' : 'info'"
            :effect="activeCategory === cat.id ? 'dark' : 'plain'"
            style="cursor: pointer;"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </el-tag>
        </div>

        <!-- 商品网格 -->
        <div class="product-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-grid-item"
            @click="addToCart(product)"
          >
            <span class="product-name">{{ product.name }}</span>
            <span class="product-price">{{ product.price }}元/{{ product.unit }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：购物车/结算 -->
      <div class="cashier-right">
        <h3 style="margin-bottom: 12px; font-size: 16px;">
          <el-icon><ShoppingCart /></el-icon> 购物车
          <span v-if="cart.length > 0" style="font-size: 12px; color: #909399; margin-left: 8px;">({{ cart.length }}件)</span>
        </h3>

        <!-- 购物车列表 -->
        <el-table :data="cart" border size="small" style="flex: 1;" max-height="300" empty-text="暂无商品">
          <el-table-column prop="name" label="商品" min-width="100" show-overflow-tooltip />
          <el-table-column prop="price" label="单价" width="70" />
          <el-table-column label="数量" width="80">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" :max="999" size="small" controls-position="right" @change="calcTotal" />
            </template>
          </el-table-column>
          <el-table-column label="重量" width="90">
            <template #default="{ row }">
              <el-input-number v-model="row.weight" :min="0" :precision="2" :step="0.1" size="small" controls-position="right" placeholder="0" @change="calcTotal" />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="80">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: 600;">{{ row.subtotal.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column width="50" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeFromCart($index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 会员搜索 -->
        <div style="margin-top: 12px;">
          <el-input v-model="memberPhone" placeholder="输入会员手机号查询" clearable>
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
          <div v-if="currentMember" style="margin-top: 8px; padding: 8px; background: #f0f9eb; border-radius: 4px; font-size: 13px;">
            <span style="color: #67C23A;">会员：{{ currentMember.name }}</span>
            <span style="margin-left: 12px;">余额：{{ currentMember.balance }}元</span>
            <span style="margin-left: 12px;">积分：{{ currentMember.points }}</span>
          </div>
        </div>

        <!-- 底部结算 -->
        <div class="cart-footer">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 16px; color: #606266;">合计：</span>
            <span style="font-size: 24px; font-weight: 700; color: #f56c6c;">
              {{ totalAmount.toFixed(2) }} 元
            </span>
          </div>

          <!-- 支付方式 -->
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <el-radio-group v-model="payMethod" size="small">
              <el-radio-button value="cash">现金</el-radio-button>
              <el-radio-button value="wechat">微信</el-radio-button>
              <el-radio-button value="alipay">支付宝</el-radio-button>
              <el-radio-button value="card">储值卡</el-radio-button>
            </el-radio-group>
          </div>

          <div style="display: flex; gap: 8px;">
            <el-button style="flex: 1;" @click="clearCart">
              <el-icon><Delete /></el-icon> 清空
            </el-button>
            <el-button type="primary" style="flex: 2;" :disabled="cart.length === 0" :loading="paying" @click="handlePay">
              <el-icon><Check /></el-icon> 确认结算（{{ cart.length }}件）
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { products, orders, members } from '../api'

const searchKeyword = ref('')
const activeCategory = ref(null)
const cart = ref([])
const memberPhone = ref('')
const currentMember = ref(null)
const payMethod = ref('cash')
const paying = ref(false)
const categories = ref([])
const allProducts = ref([])

const filteredProducts = computed(() => {
  let list = allProducts.value
  if (activeCategory.value) {
    list = list.filter(p => p.categoryId === activeCategory.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw) || (p.barcode && p.barcode.includes(kw)))
  }
  return list
})

const totalAmount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.subtotal, 0)
})

function selectCategory(catId) {
  activeCategory.value = activeCategory.value === catId ? null : catId
}

function searchProduct() {
  // filtered is computed
}

function addToCart(product) {
  const existing = cart.value.find(item => item.productId === product.id)
  if (existing) {
    existing.quantity += 1
    existing.subtotal = calcItemSubtotal(existing)
  } else {
    cart.value.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit || '斤',
      quantity: 1,
      weight: 0,
      subtotal: product.price,
    })
  }
  calcTotal()
  ElMessage.success(`已添加 ${product.name}`)
}

function removeFromCart(index) {
  cart.value.splice(index, 1)
  calcTotal()
}

function calcItemSubtotal(item) {
  if (item.weight > 0) {
    return item.price * item.weight
  }
  return item.price * item.quantity
}

function calcTotal() {
  cart.value.forEach(item => {
    item.subtotal = calcItemSubtotal(item)
  })
}

function clearCart() {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', { type: 'warning' })
    .then(() => {
      cart.value = []
      currentMember.value = null
      memberPhone.value = ''
      ElMessage.success('购物车已清空')
    })
    .catch(() => {})
}

async function handlePay() {
  if (cart.value.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }

  paying.value = true
  try {
    await orders.create({
      items: cart.value.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        weight: item.weight,
        subtotal: item.subtotal,
      })),
      totalAmount: totalAmount.value,
      payMethod: payMethod.value,
      memberId: currentMember.value?.id,
    })
    ElMessage.success(`支付成功！收款 ${totalAmount.value.toFixed(2)} 元`)
    cart.value = []
    currentMember.value = null
    memberPhone.value = ''
  } catch (e) {
    ElMessage.error('支付失败')
  } finally {
    paying.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await products.getCategories()
    categories.value = res.data?.list || res.list || []
  } catch (e) {
    categories.value = [
      { id: 1, name: '水果' },
      { id: 2, name: '蔬菜' },
      { id: 3, name: '肉禽' },
      { id: 4, name: '水产' },
      { id: 5, name: '熟食' },
    ]
  }
}

async function fetchProducts() {
  try {
    const res = await products.getList({ pageSize: 200, status: 1 })
    allProducts.value = res.data?.list || res.list || []
  } catch (e) {
    allProducts.value = [
      { id: 1, name: '红富士苹果', categoryId: 1, price: 8.90, unit: '斤', status: 1 },
      { id: 2, name: '香蕉', categoryId: 1, price: 3.50, unit: '斤', status: 1 },
      { id: 3, name: '大白菜', categoryId: 2, price: 1.98, unit: '斤', status: 1 },
      { id: 4, name: '西红柿', categoryId: 2, price: 4.50, unit: '斤', status: 1 },
      { id: 5, name: '鸡胸肉', categoryId: 3, price: 15.80, unit: '斤', status: 1 },
      { id: 6, name: '猪里脊', categoryId: 3, price: 22.00, unit: '斤', status: 1 },
      { id: 7, name: '三文鱼', categoryId: 4, price: 68.00, unit: '斤', status: 1 },
      { id: 8, name: '大虾', categoryId: 4, price: 45.00, unit: '斤', status: 1 },
      { id: 9, name: '卤鸡腿', categoryId: 5, price: 8.00, unit: '个', status: 1 },
      { id: 10, name: '烤鸭', categoryId: 5, price: 38.00, unit: '份', status: 1 },
      { id: 11, name: '车厘子', categoryId: 1, price: 59.90, unit: '斤', status: 1 },
      { id: 12, name: '草莓', categoryId: 1, price: 25.00, unit: '斤', status: 1 },
    ]
  }
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>
