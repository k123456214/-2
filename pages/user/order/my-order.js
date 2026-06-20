const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabList: [
      { id: '', name: '全部' },
      { id: '1', name: '待付款' },
      { id: '3', name: '待收货' },
      { id: '4', name: '已完成' },
      { id: '5', name: '退款' }
    ],
    activeTab: '',
    orders: []
  },

  onLoad(options) {
    if (options.status) this.setData({ activeTab: String(options.status) })
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.loadOrders()
  },

  async loadOrders() {
    util.showLoading()
    try {
      const params = { page: 1, pageSize: 50 }
      if (this.data.activeTab) params.status = Number(this.data.activeTab)
      const res = await api.order.list(params)
      const list = (res && res.list ? res.list : []).map(o => ({
        ...o,
        statusText: this.getStatusText(o.status),
        createdText: util.formatTime(o.createdAt || Date.now())
      }))
      this.setData({ orders: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  getStatusText(status) {
    const map = {
      0: '待支付', 1: '待接单', 2: '制作中', 3: '配送中', 4: '已完成', 5: '已取消'
    }
    return map[status] || '未知'
  },

  onOrderTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/food/order-detail/order-detail?id=' + id })
  },

  async onPay(e) {
    const id = e.currentTarget.dataset.id
    util.showLoading('支付中...')
    try {
      await api.order.pay(id)
      util.showToast('支付成功', 'success')
      this.loadOrders()
    } catch (e) {
      util.hideLoading()
      util.showToast('支付失败')
    }
  },

  async onCancel(e) {
    const id = e.currentTarget.dataset.id
    const ok = await util.confirm('提示', '确认取消订单？')
    if (!ok) return
    try {
      await api.order.cancel(id)
      util.showToast('已取消')
      this.loadOrders()
    } catch (e) {
      util.showToast('取消失败')
    }
  },

  async onConfirm(e) {
    const id = e.currentTarget.dataset.id
    const ok = await util.confirm('提示', '确认收货？')
    if (!ok) return
    try {
      await api.order.confirm(id)
      util.showToast('已确认', 'success')
      this.loadOrders()
    } catch (e) {
      util.showToast('操作失败')
    }
  },

  onRefund(e) {
    const id = e.currentTarget.dataset.id
    util.showToast('申请退款 (模拟)')
  },

  onShopTap(e) {
    const id = e.currentTarget.dataset.shop
    wx.navigateTo({ url: '/pages/food/shop/shop?shopId=' + id })
  }
})
