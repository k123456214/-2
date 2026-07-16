const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    shop: null,
    stats: null,
    todayOrders: []
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    util.showLoading()
    try {
      const [shop, stats] = await Promise.all([
        api.merchant.myShop(),
        api.merchant.stats()
      ])
      const shopData = shop || {
        id: 1, name: '我的店铺', rating: 4.8, sales: 1000, minOrder: 10
      }
      const statsData = stats || {
        todayOrders: 12, todaySales: 268.5, weekOrders: 86, weekSales: 1890,
        dailyData: [
          { date: '周一', sales: 320 }, { date: '周二', sales: 280 },
          { date: '周三', sales: 450 }, { date: '周四', sales: 380 },
          { date: '周五', sales: 520 }, { date: '周六', sales: 650 },
          { date: '周日', sales: 480 }
        ]
      }
      const maxSales = Math.max(...statsData.dailyData.map(d => d.sales))
      const orders = await api.order.merchantList ? (await api.order.merchantList({ page: 1, pageSize: 5 })) : { list: [] }
      const ordersList = orders && orders.list ? orders.list : []
      this.setData({
        shop: shopData,
        stats: {
          ...statsData,
          dailyData: statsData.dailyData.map(d => ({
            ...d,
            percent: (d.sales / maxSales * 100).toFixed(0)
          }))
        },
        todayOrders: ordersList.length > 0 ? ordersList : [
          { id: 'OD1001', userName: '用户A', total: 28.5, items: '经典汉堡x1, 可乐x1', status: 1, time: '10:15' },
          { id: 'OD1002', userName: '用户B', total: 42, items: '双人套餐', status: 2, time: '11:20' },
          { id: 'OD1003', userName: '用户C', total: 18, items: '单品x1', status: 3, time: '11:45' }
        ]
      })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onGoodsManage() {
    wx.navigateTo({ url: '/pages/merchant/goods-manage/goods-manage' })
  },

  onOrderManage() {
    wx.navigateTo({ url: '/pages/merchant/order-manage/order-manage' })
  },

  onShopSettings() {
    util.showToast('店铺设置 (模拟)')
  },

  onStats() {
    util.showToast('数据统计 (模拟)')
  },

  onPrinter() {
    util.showToast('云打印机 (模拟)')
  },

  onOrderDetail(e) {
    wx.navigateTo({ url: '/pages/food/order-detail/order-detail?id=' + e.currentTarget.dataset.id })
  }
})
