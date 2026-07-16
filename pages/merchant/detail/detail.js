const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    shop: null,
    goods: [],
    tabs: [
      { id: 'goods', name: '商品' },
      { id: 'detail', name: '商家详情' }
    ],
    activeTab: 'goods'
  },

  onLoad(options) {
    this.shopId = options.id
    this.loadShop()
  },

  async loadShop() {
    util.showLoading()
    try {
      const res = await api.merchant.detail(this.shopId)
      const shop = res || {
        id: this.shopId, name: '示例店铺', rating: 4.8, sales: 1000,
        address: '校园东门', phone: '138****8888', openTime: '09:00-22:00',
        description: '校园品质商家', minOrder: 10, deliveryFee: 3,
        goods: [{ id: 1, name: '招牌套餐', price: 28, originalPrice: 35 }]
      }
      this.setData({
        shop,
        goods: (shop.goods || []).map(g => ({ ...g, shopId: shop.id }))
      })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
  },

  onOrderTap() {
    wx.navigateTo({ url: '/pages/food/shop/shop?shopId=' + this.shopId })
  },

  onGoodsTap(e) {
    wx.navigateTo({ url: '/pages/food/shop/shop?shopId=' + this.shopId })
  },

  onCallTap() {
    if (this.data.shop && this.data.shop.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.shop.phone,
        fail: () => util.showToast('呼叫失败')
      })
    }
  },

  onLocationTap() {
    util.showToast('导航到店铺 (模拟)')
  }
})
