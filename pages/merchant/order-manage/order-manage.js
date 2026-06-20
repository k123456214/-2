const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: '', name: '全部' },
      { id: '1', name: '待接单' },
      { id: '2', name: '制作中' },
      { id: '3', name: '配送中' },
      { id: '4', name: '已完成' }
    ],
    activeTab: '',
    orders: []
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
      let res = null
      try {
        res = await api.order.merchantList(params)
      } catch (e) {
        res = null
      }
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 'OD2001', userName: '用户A', phone: '138****1111', address: '宿舍1号楼', total: 28.5, items: [{ name: '经典汉堡', count: 1, price: 28.5 }], status: 1, createdAt: Date.now() - 1800000, time: '10:15' },
          { id: 'OD2002', userName: '用户B', phone: '138****2222', address: '图书馆', total: 42, items: [{ name: '双人套餐', count: 1, price: 42 }], status: 2, createdAt: Date.now() - 3600000, time: '11:20' },
          { id: 'OD2003', userName: '用户C', phone: '138****3333', address: '教学楼B201', total: 18, items: [{ name: '单品', count: 1, price: 18 }], status: 3, createdAt: Date.now() - 7200000, time: '11:45' },
          { id: 'OD2004', userName: '用户D', phone: '138****4444', address: '宿舍3号楼', total: 32, items: [{ name: '牛肉饭套餐', count: 1, price: 32 }], status: 4, createdAt: Date.now() - 86400000, time: '昨天 12:30' }
        ]
        if (this.data.activeTab) {
          list = list.filter(o => String(o.status) === this.data.activeTab)
        }
      }
      this.setData({ orders: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  getStatusText(status) {
    const map = { 1: '待接单', 2: '制作中', 3: '配送中', 4: '已完成', 5: '已取消' }
    return map[status] || '未知'
  },

  onAccept(e) {
    const id = e.currentTarget.dataset.id
    const idx = e.currentTarget.dataset.idx
    util.showLoading()
    setTimeout(() => {
      const list = this.data.orders.slice()
      if (list[idx]) {
        list[idx].status = 2
        this.setData({ orders: list })
      }
      util.hideLoading()
      util.showToast('已接单', 'success')
    }, 500)
  },

  onReject(e) {
    const id = e.currentTarget.dataset.id
    const idx = e.currentTarget.dataset.idx
    wx.showModal({
      title: '提示',
      content: '确认拒绝此订单？',
      success: (res) => {
        if (res.confirm) {
          const list = this.data.orders.slice()
          if (list[idx]) {
            list[idx].status = 5
            this.setData({ orders: list })
          }
          util.showToast('已拒绝')
        }
      }
    })
  },

  onPrint(e) {
    util.showToast('小票打印中...')
    setTimeout(() => util.showToast('打印成功', 'success'), 800)
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone, fail: () => util.showToast('呼叫失败') })
    }
  },

  onDeliver(e) {
    const idx = e.currentTarget.dataset.idx
    const list = this.data.orders.slice()
    if (list[idx]) {
      list[idx].status = 3
      this.setData({ orders: list })
    }
    util.showToast('已标记配送中', 'success')
  },

  onComplete(e) {
    const idx = e.currentTarget.dataset.idx
    const list = this.data.orders.slice()
    if (list[idx]) {
      list[idx].status = 4
      this.setData({ orders: list })
    }
    util.showToast('订单已完成', 'success')
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/food/order-detail/order-detail?id=' + id })
  }
})
