const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    categories: [
      { id: '', name: '全部' },
      { id: '餐饮', name: '餐饮' },
      { id: '零售', name: '零售' },
      { id: '服务', name: '服务' }
    ],
    sortOptions: [
      { id: 'rating', name: '评分优先' },
      { id: 'sales', name: '销量优先' },
      { id: 'distance', name: '距离优先' }
    ],
    activeCat: '',
    activeSort: 'rating',
    shops: []
  },

  onLoad() {
    this.loadShops()
  },

  onPullDownRefresh() {
    this.loadShops().then(() => wx.stopPullDownRefresh())
  },

  onCatTap(e) {
    this.setData({ activeCat: e.currentTarget.dataset.id })
    this.loadShops()
  },

  onSortTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ activeSort: id })
    this.sortShops()
  },

  async loadShops() {
    util.showLoading()
    try {
      let params = { page: 1, pageSize: 50 }
      if (this.data.activeCat) params.category = this.data.activeCat
      const res = await api.merchant.list(params)
      let list = res && res.list ? res.list : []
      list = list.map(s => ({ ...s, distance: (Math.random() * 2 + 0.1).toFixed(1) + 'km' }))
      this.setData({ shops: list })
      this.sortShops()
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  sortShops() {
    let list = this.data.shops.slice()
    const sort = this.data.activeSort
    if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sort === 'sales') list.sort((a, b) => (b.sales || 0) - (a.sales || 0))
    else list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    this.setData({ shops: list })
  },

  onShopTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/merchant/detail/detail?id=' + id })
  },

  onApplyTap() {
    wx.navigateTo({ url: '/pages/merchant/apply/apply' })
  }
})
