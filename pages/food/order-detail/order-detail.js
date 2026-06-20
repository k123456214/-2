// pages/food/order-detail/order-detail.js
const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    order: null,
    statusText: '',
    statusSteps: [
      { key: 1, title: '商家接单', icon: '🏪' },
      { key: 2, title: '制作中', icon: '🍳' },
      { key: 3, title: '配送中', icon: '🛵' },
      { key: 4, title: '已送达', icon: '🎉' }
    ]
  },

  onLoad(options) {
    this.orderId = options.id
    this.loadOrder()
    this.timer = setInterval(() => this.loadOrder(), 5000)
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },

  async loadOrder() {
    try {
      // 先尝试从mock数据中查询，若无则生成示例
      let order = await api.order.detail(this.orderId)
      if (!order) {
        // 生成一个模拟订单
        order = {
          id: 'OD10001',
          shopName: '麦香汉堡',
          status: 2,
          totalPrice: 28,
          deliveryFee: 3,
          payPrice: 31,
          address: { name: '张同学', phone: '138****8888', address: '3号楼501' },
          remark: '不要辣',
          goods: [
            { id: 1, name: '经典牛肉汉堡套餐', spec: '原味/芝士', price: 28, count: 1 }
          ],
          createdAt: Date.now() - 600000,
          logs: [
            { time: Date.now() - 600000, text: '订单已创建' },
            { time: Date.now() - 480000, text: '商家已接单' },
            { time: Date.now() - 240000, text: '骑手已取货' },
            { time: Date.now(), text: '正在配送中...' }
          ]
        }
      }
      const statusMap = ['待支付', '已支付', '制作中', '配送中', '已完成', '已取消']
      order.createdAtText = util.formatTime(order.createdAt)
      order.logsText = (order.logs || []).map(l => ({ ...l, timeText: util.formatTime(l.time) })).reverse()
      this.setData({
        order,
        statusText: statusMap[order.status] || '未知'
      })
    } catch (e) {
      console.error(e)
    }
  },

  onCallRider() {
    wx.showModal({ title: '联系骑手', content: '骑手电话: 138****0001', confirmText: '拨打', success: (res) => { if (res.confirm) wx.makePhoneCall({ phoneNumber: '13800000001' }) } })
  },

  onCallShop() {
    wx.showModal({ title: '联系商家', content: '商家电话: 138****0002', confirmText: '拨打', success: (res) => { if (res.confirm) wx.makePhoneCall({ phoneNumber: '13800000002' }) } })
  },

  onRefund() {
    wx.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？',
      success: async (res) => {
        if (res.confirm) {
          await api.order.refund(this.orderId, '用户申请退款')
          wx.showToast({ title: '已申请退款', icon: 'success' })
        }
      }
    })
  },

  onConfirmReceive() {
    wx.showModal({
      title: '确认收货',
      content: '请确认已收到商品',
      success: async (res) => {
        if (res.confirm) {
          await api.order.confirm(this.orderId)
          wx.showToast({ title: '已完成订单', icon: 'success' })
          this.loadOrder()
        }
      }
    })
  },

  onPrint() {
    wx.showLoading({ title: '正在打印...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '已发送至打印机', icon: 'success' })
    }, 1500)
  },

  onShareAppMessage() {
    return { title: '订单详情', path: '/pages/food/order-detail/order-detail?id=' + this.orderId }
  }
})
