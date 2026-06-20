// pages/food/index/index.js - 外卖首页
const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    merchants: [],
    categories: ['全部', '餐饮', '零售', '服务'],
    activeCategory: 0,
    keyword: '',
    location: '定位中...',
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadMerchants(true)
  },

  onShow() {
    const app = getApp()
    if (app.globalData.location) {
      const loc = app.globalData.location
      this.setData({ location: '纬度' + loc.latitude.toFixed(2) })
    }
  },

  async loadMerchants(reset = false) {
    if (reset) this.data.page = 1
    const p = {
      page: this.data.page,
      pageSize: 10,
      category: this.data.activeCategory === 0 ? '' : this.data.categories[this.data.activeCategory],
      keyword: this.data.keyword
    }
    try {
      const res = await api.merchant.list(p)
      const list = res && res.list ? res.list : []
      this.setData({
        merchants: reset ? list : this.data.merchants.concat(list),
        hasMore: res && res.hasMore
      })
    } catch (e) {
      console.error(e)
    }
  },

  onCategoryTap(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ activeCategory: idx })
    this.loadMerchants(true)
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
    util.debounce(() => this.loadMerchants(true), 400)()
  },

  onShopTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/food/shop/shop?shopId=' + id })
  },

  onPullDownRefresh() {
    this.loadMerchants(true).then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.data.page++
      this.loadMerchants(false)
    }
  }
})
