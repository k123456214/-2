// utils/api.js - API 统一封装
const req = require('./request.js')

module.exports = {
  // ========== 用户模块 ==========
  user: {
    profile: () => req.get('/api/user/profile'),
    update: (data) => req.put('/api/user/profile', data),
    login: (data) => req.post('/api/user/login', data),
    register: (data) => req.post('/api/user/register', data),
    levelInfo: () => req.get('/api/user/level'),
    pointsLog: (p) => req.get('/api/user/points', p)
  },

  // ========== 商户模块 ==========
  merchant: {
    apply: (data) => req.post('/api/merchant/apply', data),
    applyStatus: () => req.get('/api/merchant/apply/status'),
    list: (p) => req.get('/api/merchant/list', p),
    detail: (id) => req.get('/api/merchant/detail/' + id),
    myShop: () => req.get('/api/merchant/my-shop'),
    updateShop: (data) => req.put('/api/merchant/my-shop', data),
    stats: () => req.get('/api/merchant/stats')
  },

  // ========== 商品模块 ==========
  goods: {
    list: (p) => req.get('/api/goods/list', p),
    detail: (id) => req.get('/api/goods/detail/' + id),
    create: (data) => req.post('/api/goods', data),
    update: (id, data) => req.put('/api/goods/' + id, data),
    delete: (id) => req.delete('/api/goods/' + id),
    toggleStatus: (id, status) => req.put('/api/goods/' + id + '/status', { status }),
    categories: () => req.get('/api/goods/categories')
  },

  // ========== 外卖订单 ==========
  order: {
    list: (p) => req.get('/api/order/list', p),
    detail: (id) => req.get('/api/order/detail/' + id),
    create: (data) => req.post('/api/order', data),
    pay: (id) => req.post('/api/order/' + id + '/pay'),
    cancel: (id) => req.post('/api/order/' + id + '/cancel'),
    confirm: (id) => req.post('/api/order/' + id + '/confirm'),
    refund: (id, reason) => req.post('/api/order/' + id + '/refund', { reason }),
    print: (id) => req.post('/api/order/' + id + '/print'),
    merchantList: (p) => req.get('/api/merchant/order/list', p)
  },

  // ========== 跑腿 ==========
  errand: {
    list: (p) => req.get('/api/errand/list', p),
    detail: (id) => req.get('/api/errand/detail/' + id),
    create: (data) => req.post('/api/errand', data),
    accept: (id) => req.post('/api/errand/' + id + '/accept'),
    complete: (id) => req.post('/api/errand/' + id + '/complete'),
    location: (id) => req.get('/api/errand/' + id + '/location')
  },

  // ========== 社区 ==========
  community: {
    list: (p) => req.get('/api/community/list', p),
    detail: (id) => req.get('/api/community/detail/' + id),
    create: (data) => req.post('/api/community', data),
    join: (id) => req.post('/api/community/' + id + '/join'),
    posts: (id, p) => req.get('/api/community/' + id + '/posts', p),
    postCreate: (id, data) => req.post('/api/community/' + id + '/posts', data),
    activities: (p) => req.get('/api/community/activities', p),
    activitySignUp: (id) => req.post('/api/community/activity/' + id + '/signup'),
    activityCheckIn: (id) => req.post('/api/community/activity/' + id + '/checkin')
  },

  // ========== 论坛 ==========
  forum: {
    boards: () => req.get('/api/forum/boards'),
    list: (p) => req.get('/api/forum/list', p),
    detail: (id) => req.get('/api/forum/detail/' + id),
    create: (data) => req.post('/api/forum', data),
    reply: (id, data) => req.post('/api/forum/' + id + '/reply'),
    like: (id) => req.post('/api/forum/' + id + '/like'),
    favorite: (id) => req.post('/api/forum/' + id + '/favorite'),
    search: (kw) => req.get('/api/forum/search', { kw }),
    vote: (id, optionId) => req.post('/api/forum/' + id + '/vote', { optionId })
  },

  // ========== 表白墙 ==========
  confession: {
    list: (p) => req.get('/api/confession/list', p),
    hot: (p) => req.get('/api/confession/hot', p),
    detail: (id) => req.get('/api/confession/detail/' + id),
    create: (data) => req.post('/api/confession', data),
    comment: (id, data) => req.post('/api/confession/' + id + '/comment'),
    like: (id) => req.post('/api/confession/' + id + '/like'),
    report: (id, reason) => req.post('/api/confession/' + id + '/report', { reason })
  },

  // ========== 二手市场 ==========
  market: {
    list: (p) => req.get('/api/market/list', p),
    detail: (id) => req.get('/api/market/detail/' + id),
    create: (data) => req.post('/api/market', data),
    myGoods: (p) => req.get('/api/market/my-goods', p),
    offline: (id) => req.put('/api/market/' + id + '/offline'),
    favorite: (id) => req.post('/api/market/' + id + '/favorite'),
    categories: () => req.get('/api/market/categories')
  },

  // ========== 优惠券 ==========
  coupon: {
    list: () => req.get('/api/coupon/list'),
    myCoupons: () => req.get('/api/coupon/my'),
    receive: (id) => req.post('/api/coupon/' + id + '/receive'),
    use: (id, orderId) => req.post('/api/coupon/' + id + '/use', { orderId })
  },

  // ========== DIY 页面 ==========
  diy: {
    list: () => req.get('/api/diy/list'),
    detail: (id) => req.get('/api/diy/detail/' + id)
  },

  // ========== 支付 ==========
  payment: {
    wxPay: (orderId) => req.post('/api/payment/wxpay', { orderId })
  },

  // ========== 通用云打印机 ==========
  printer: {
    list: () => req.get('/api/printer/list'),
    add: (data) => req.post('/api/printer', data),
    print: (printerId, content) => req.post('/api/printer/' + printerId + '/print', { content }),
    status: (printerId) => req.get('/api/printer/' + printerId + '/status'),
    // 通用云打印：飞鹅、易联云、商米等
    supported: ['feie', 'yilianyun', 'shangmi', 'xprinter']
  }
}
