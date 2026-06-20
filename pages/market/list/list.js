const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: '', name: '全部' },
      { id: '数码', name: '数码' },
      { id: '书籍', name: '书籍' },
      { id: '服饰', name: '服饰' },
      { id: '生活用品', name: '生活' },
      { id: '其他', name: '其他' }
    ],
    activeTab: '',
    keyword: '',
    goods: []
  },

  onShow() {
    this.loadGoods()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.loadGoods()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.loadGoods()
  },

  async loadGoods() {
    util.showLoading()
    try {
      let res = null
      try {
        res = await api.market.list({ page: 1, pageSize: 30, category: this.data.activeTab, keyword: this.data.keyword })
      } catch (e) {}
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, title: '九成新 MacBook Pro 2023', price: 6800, originalPrice: 14999, category: '数码', views: 320, likes: 18, seller: '毕业学长', location: '5号宿舍', createdAt: Date.now() - 86400000 },
          { id: 2, title: '高数教材 + 习题册一套', price: 30, originalPrice: 120, category: '书籍', views: 120, likes: 5, seller: '学姐', location: '图书馆', createdAt: Date.now() - 172800000 },
          { id: 3, title: 'Nike 运动鞋 42码', price: 280, originalPrice: 799, category: '服饰', views: 80, likes: 3, seller: '同学D', location: '东门', createdAt: Date.now() - 259200000 },
          { id: 4, title: '可调光护眼台灯', price: 50, originalPrice: 180, category: '生活用品', views: 60, likes: 2, seller: '学长A', location: '3号宿舍', createdAt: Date.now() - 345600000 },
          { id: 5, title: 'iPad Air 64G 二手', price: 2200, originalPrice: 4599, category: '数码', views: 520, likes: 35, seller: '毕业生', location: '南门', createdAt: Date.now() - 432000000 },
          { id: 6, title: '英语四级历年真题', price: 15, originalPrice: 58, category: '书籍', views: 200, likes: 10, seller: '学霸', location: '图书馆', createdAt: Date.now() - 518400000 }
        ]
      }
      this.setData({ goods: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/market/detail/detail?id=' + id })
  },

  onPublish() {
    wx.navigateTo({ url: '/pages/market/publish/publish' })
  },

  onMyGoods() {
    wx.navigateTo({ url: '/pages/market/my-goods/my-goods' })
  }
})
