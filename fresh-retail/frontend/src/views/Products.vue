<template>
  <div class="page-container">
    <div class="page-header">
      <h2>商品管理</h2>
      <div>
        <el-button type="primary" @click="openDialog(null)">
          <el-icon><Plus /></el-icon> 新增商品
        </el-button>
        <el-button @click="$router.push('/products/category')">
          <el-icon><FolderOpened /></el-icon> 分类管理
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input v-model="filters.keyword" placeholder="搜索商品名称/条码" clearable style="width: 220px;" @clear="fetchList" @keyup.enter="fetchList" />
      <el-select v-model="filters.categoryId" placeholder="选择分类" clearable style="width: 160px;" @change="fetchList">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-select v-model="filters.status" placeholder="商品状态" clearable style="width: 120px;" @change="fetchList">
        <el-option label="上架" value="1" />
        <el-option label="下架" value="0" />
      </el-select>
      <el-button type="primary" @click="fetchList"><el-icon><Search /></el-icon> 搜索</el-button>
    </div>

    <!-- 商品列表 -->
    <el-card shadow="never">
      <el-table :data="tableData" stripe v-loading="loading" border>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="barcode" label="条码" width="140" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="price" label="售价(元)" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600;">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该商品吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingProduct ? '编辑商品' : '新增商品'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="条码" prop="barcode">
          <el-input v-model="form.barcode" placeholder="请输入商品条码" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%;">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" placeholder="请选择单位" style="width: 100%;">
            <el-option label="斤" value="斤" />
            <el-option label="公斤" value="公斤" />
            <el-option label="个" value="个" />
            <el-option label="份" value="份" />
            <el-option label="盒" value="盒" />
            <el-option label="包" value="包" />
          </el-select>
        </el-form-item>
        <el-form-item label="售价" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="form.costPrice" :min="0" :precision="2" :step="0.1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="库存预警" prop="stockWarning">
          <el-input-number v-model="form.stockWarning" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
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
import { products } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const editingProduct = ref(null)
const formRef = ref(null)
const tableData = ref([])
const categories = ref([])

const filters = reactive({
  keyword: '',
  categoryId: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const form = reactive({
  name: '',
  barcode: '',
  categoryId: '',
  unit: '斤',
  price: 0,
  costPrice: 0,
  stock: 0,
  stockWarning: 10,
  status: 1,
})

const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  barcode: [{ required: true, message: '请输入条码', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res = await products.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
    })
    tableData.value = res.data?.list || res.list || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e) {
    // 使用模拟数据
    tableData.value = [
      { id: 1, name: '有机红富士苹果', barcode: '6901234567890', categoryName: '水果', unit: '斤', price: 8.90, stock: 500, status: 1 },
      { id: 2, name: '新鲜三文鱼', barcode: '6901234567891', categoryName: '水产', unit: '斤', price: 68.00, stock: 50, status: 1 },
      { id: 3, name: '澳洲进口牛排', barcode: '6901234567892', categoryName: '肉禽', unit: '份', price: 58.00, stock: 80, status: 1 },
      { id: 4, name: '有机蔬菜套餐', barcode: '6901234567893', categoryName: '蔬菜', unit: '份', price: 29.90, stock: 200, status: 1 },
      { id: 5, name: '智利车厘子', barcode: '6901234567894', categoryName: '水果', unit: '斤', price: 59.90, stock: 30, status: 1 },
    ]
    pagination.total = 5
  } finally {
    loading.value = false
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
      { id: 6, name: '粮油' },
    ]
  }
}

function openDialog(row) {
  editingProduct.value = row
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, {
      name: '', barcode: '', categoryId: '', unit: '斤',
      price: 0, costPrice: 0, stock: 0, stockWarning: 10, status: 1,
    })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (editingProduct.value) {
      await products.update(editingProduct.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await products.create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error(editingProduct.value ? '更新失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(id) {
  try {
    await products.remove(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchCategories()
  fetchList()
})
</script>
