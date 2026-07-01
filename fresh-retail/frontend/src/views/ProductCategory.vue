<template>
  <div class="page-container">
    <div class="page-header">
      <h2>分类管理</h2>
      <div>
        <el-button type="primary" @click="openDialog(null)">
          <el-icon><Plus /></el-icon> 新增分类
        </el-button>
        <el-button @click="$router.push('/products')">
          <el-icon><ArrowLeft /></el-icon> 返回商品管理
        </el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-table
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        border
        v-loading="loading"
        default-expand-all
      >
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="addChild(row)">添加子分类</el-button>
            <el-popconfirm title="确定删除该分类吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingItem ? '编辑分类' : '新增分类'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select v-model="form.parentId" placeholder="无（顶级分类）" clearable style="width: 100%;">
            <el-option v-for="cat in flatCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { products } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const editingItem = ref(null)
const formRef = ref(null)
const tableData = ref([])

const form = reactive({
  name: '',
  parentId: null,
  sort: 0,
  status: 1,
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const flatCategories = computed(() => {
  const result = []
  function flatten(list) {
    list.forEach(item => {
      result.push(item)
      if (item.children) flatten(item.children)
    })
  }
  flatten(tableData.value)
  return result.filter(c => c.id !== editingItem.value?.id)
})

async function fetchList() {
  loading.value = true
  try {
    const res = await products.getCategories()
    tableData.value = res.data?.list || res.list || []
  } catch (e) {
    tableData.value = [
      { id: 1, name: '水果', sort: 1, status: 1, children: [
        { id: 11, name: '国产水果', sort: 1, status: 1 },
        { id: 12, name: '进口水果', sort: 2, status: 1 },
      ]},
      { id: 2, name: '蔬菜', sort: 2, status: 1, children: [
        { id: 21, name: '叶菜类', sort: 1, status: 1 },
        { id: 22, name: '根茎类', sort: 2, status: 1 },
      ]},
      { id: 3, name: '肉禽', sort: 3, status: 1 },
      { id: 4, name: '水产', sort: 4, status: 1 },
      { id: 5, name: '熟食', sort: 5, status: 1 },
      { id: 6, name: '粮油', sort: 6, status: 1 },
    ]
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  editingItem.value = row
  if (row) {
    Object.assign(form, { name: row.name, parentId: row.parentId, sort: row.sort, status: row.status })
  } else {
    Object.assign(form, { name: '', parentId: null, sort: 0, status: 1 })
  }
  dialogVisible.value = true
}

function addChild(row) {
  editingItem.value = null
  Object.assign(form, { name: '', parentId: row.id, sort: 0, status: 1 })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (editingItem.value) {
      await products.updateCategory(editingItem.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await products.createCategory(form)
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
    await products.removeCategory(id)
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
