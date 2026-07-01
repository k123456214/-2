import request from './request'

// ========== 认证 / 用户管理 ==========
export const auth = {
  login: (data) => request.post('/auth/login', data),
  getProfile: () => request.get('/auth/profile'),
  updateProfile: (data) => request.put('/auth/profile', data),
  getUsers: (params) => request.get('/auth/users', { params }),
  createUser: (data) => request.post('/auth/users', data),
  updateUser: (id, data) => request.put(`/auth/users/${id}`, data),
  deleteUser: (id) => request.delete(`/auth/users/${id}`),
}

// ========== 商品管理 ==========
export const products = {
  getList: (params) => request.get('/products', { params }),
  getDetail: (id) => request.get(`/products/${id}`),
  create: (data) => request.post('/products', data),
  update: (id, data) => request.put(`/products/${id}`, data),
  remove: (id) => request.delete(`/products/${id}`),
  getCategories: (params) => request.get('/products/categories/tree', { params }),
  getCategoryList: (params) => request.get('/products/categories/list', { params }),
  createCategory: (data) => request.post('/products/categories', data),
  updateCategory: (id, data) => request.put(`/products/categories/${id}`, data),
  removeCategory: (id) => request.delete(`/products/categories/${id}`),
}

// ========== 库存管理 ==========
export const stocks = {
  getList: (params) => request.get('/stocks', { params }),
  getWarnings: (params) => request.get('/stocks/warnings', { params }),
  adjust: (data) => request.post('/stocks/adjust', data),
  transfer: (data) => request.post('/stocks/transfer', data),
  getHistory: (params) => request.get('/stocks/history', { params }),
}

// ========== 订单管理 ==========
export const orders = {
  getList: (params) => request.get('/orders', { params }),
  getDetail: (id) => request.get(`/orders/${id}`),
  create: (data) => request.post('/orders', data),
  updateStatus: (id, data) => request.put(`/orders/${id}/status`, data),
  getStatistics: (params) => request.get('/orders/statistics', { params }),
}

// ========== 会员管理 ==========
export const members = {
  getList: (params) => request.get('/members', { params }),
  getDetail: (id) => request.get(`/members/${id}`),
  create: (data) => request.post('/members', data),
  update: (id, data) => request.put(`/members/${id}`, data),
  recharge: (id, data) => request.post(`/members/${id}/recharge`, data),
  addPoints: (id, data) => request.post(`/members/${id}/points/add`, data),
  deductPoints: (id, data) => request.post(`/members/${id}/points/deduct`, data),
  getLevels: (params) => request.get('/members/levels', { params }),
  createLevel: (data) => request.post('/members/levels', data),
  updateLevel: (id, data) => request.put(`/members/levels/${id}`, data),
}

// ========== 门店管理 ==========
export const stores = {
  getList: (params) => request.get('/stores', { params }),
  getDetail: (id) => request.get(`/stores/${id}`),
  create: (data) => request.post('/stores', data),
  update: (id, data) => request.put(`/stores/${id}`, data),
  remove: (id) => request.delete(`/stores/${id}`),
}

// ========== 供应商管理 ==========
export const suppliers = {
  getList: (params) => request.get('/suppliers', { params }),
  getDetail: (id) => request.get(`/suppliers/${id}`),
  create: (data) => request.post('/suppliers', data),
  update: (id, data) => request.put(`/suppliers/${id}`, data),
  remove: (id) => request.delete(`/suppliers/${id}`),
}

// ========== 采购管理 ==========
export const purchases = {
  getList: (params) => request.get('/purchases', { params }),
  getDetail: (id) => request.get(`/purchases/${id}`),
  create: (data) => request.post('/purchases', data),
  updateStatus: (id, data) => request.put(`/purchases/${id}/status`, data),
  receiveItem: (orderId, itemId, data) => request.put(`/purchases/${orderId}/items/${itemId}/receive`, data),
  getStatistics: (params) => request.get('/purchases/statistics', { params }),
}

// ========== 损耗管理 ==========
export const loss = {
  getList: (params) => request.get('/loss', { params }),
  create: (data) => request.post('/loss', data),
  approve: (id) => request.put(`/loss/${id}/approve`),
  reject: (id) => request.put(`/loss/${id}/reject`),
  getStatistics: (params) => request.get('/loss/statistics', { params }),
}

// ========== 数据看板 ==========
export const dashboard = {
  getOverview: () => request.get('/dashboard/overview'),
  getSalesTrend: (params) => request.get('/dashboard/sales-trend', { params }),
  getCategorySales: (params) => request.get('/dashboard/category-sales', { params }),
  getStoreRanking: (params) => request.get('/dashboard/store-ranking', { params }),
  getLossAnalysis: (params) => request.get('/dashboard/loss-analysis', { params }),
  getTopProducts: (params) => request.get('/dashboard/top-products', { params }),
}
