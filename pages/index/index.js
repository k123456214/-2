// pages/index/index.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    bannerList: [
      { id: 1, title: '校园外卖新上线', image: '', color: '#1890ff', route: '/pages/food/index/index' },
      { id: 2, title: '表白墙今日精选', image: '', color: '#f5222d', route: '/pages/confession/list/list' },
      { id: 3, title: '二手市场大促', image: '', color: '#52c41a', route: '/pages/market/list/list' }
    ],
    categories: [
      { id: 'food', name: '外卖点餐', icon: '🍔', route: '/pages/food/index/index', color: '#ff7a45' },
      { id: 'market', name: '二手市场', icon: '🛍️', route: '/pages/market/list/list', color: '#52c41a' },
      { id: 'confession', name: '表白墙', icon: '💌', route: '/pages/confession/list/list', color: '#f5222d' },
      { id: 'forum', name: '校园论坛', icon: '📚', route: '/pages/forum/list/list', color: '#1890ff' },
      { id: 'community', name: '兴趣社区', icon: '🎯', route: '/pages/community/list/list', color: '#722ed1' },
      { id: 'errand', name: '跑腿服务', icon: '🏃', route: '/pages/errand/list/list', color: '#fa8c16' },
      { id: 'shop', name: '商户入驻', icon: '🏪', route: '/pages/merchant/apply/apply', color: '#13c2c2' },
      { id: 'diy', name: '自定义', icon: '✨', route: '/pages/custom/diy/diy', color: '#eb2f96' }
    ],
    merchants: [],
    hotGoods: [],
    forumHot: [],
    diyPages: [],
    userInfo: null
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    const app = getApp()
    if (app && app.globalData && app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo })
    }
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  async loadData() {
    util.showLoading()
    try {
      const [merchants, goods, forum, diy] = await Promise.all([
        api.merchant.list({ page: 1, pageSize: 5 }),
        api.goods.list({ page: 1, pageSize: 6 }),
        api.forum.list({ page: 1, pageSize: 3 }),
        api.diy.list()
      ])
      this.setData({
        merchants: merchants && merchants.list ? merchants.list : [],
        hotGoods: goods && goods.list ? goods.list : [],
        forumHot: forum && forum.list ? forum.list.map(f => ({ ...f, timeText: util.timeAgo(f.createdAt) })) : [],
        diyPages: diy || []
      })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onNavigate(e) {
    const route = e.currentTarget.dataset.route
    if (!route) return
    if (route.startsWith('/pages/food') || route.startsWith('/pages/forum') || route.startsWith('/pages/community') || route.startsWith('/pages/index')) {
      wx.switchTab({ url: route, fail: () => wx.navigateTo({ url: route }) })
    } else {
      wx.navigateTo({ url: route })
    }
  },

  onMerchantTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/merchant/detail/detail?id=' + id })
  },

  onGoodsTap(e) {
    const id = e.currentTarget.dataset.id
    const shopId = e.currentTarget.dataset.shop
    wx.navigateTo({ url: '/pages/food/shop/shop?shopId=' + shopId })
  },

  onForumTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/forum/detail/detail?id=' + id })
  },

  onDiyTap(e) {
    const id = e.currentTarget.dataset.id
    const page = this.data.diyPages.find(p => p.id == id)
    if (page && page.isH5) {
      wx.navigateTo({ url: '/pages/custom/h5/h5?url=' + encodeURIComponent(page.h5Url) + '&title=' + encodeURIComponent(page.title) })
    } else {
      wx.navigateTo({ url: '/pages/custom/diy/diy?id=' + id })
    }
  },

  onLogin() {
    const app = getApp()
    app.requireLogin(() => {})
  },

  onShareAppMessage() {
    return {
      title: '校园综合服务 - 外卖、跑腿、社区、论坛、二手市场',
      path: '/pages/index/index'
    }
  }
})
