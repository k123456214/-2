const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: 'goods', name: '商品' },
      { id: 'shop', name: '店铺' }
    ],
    activeTab: 'goods',
    goods: [],
    shops: []
  },

  onLoad() {
    this.loadData()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
  },

  async loadData() {
    util.showLoading()
    try {
      const [goods, shops] = await Promise.all([
        api.goods.list({ page: 1, pageSize: 10 }),
        api.merchant.list({ page: 1, pageSize: 10 })
      ])
      this.setData({
        goods: goods && goods.list ? goods.list : [],
        shops: shops && shops.list ? shops.list : []
      })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onGoodsTap(e) {
    const id = e.currentTarget.dataset.id
    const shopId = e.currentTarget.dataset.shop
    wx.navigateTo({ url: '/pages/food/shop/shop?shopId=' + (shopId || 1) })
  },

  onShopTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/merchant/detail/detail?id=' + id })
  },

  onCancel(e) {
    util.showToast('已取消收藏')
  }
})
