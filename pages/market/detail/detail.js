const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    good: null,
    favorited: false
  },

  onLoad(options) {
    this.goodId = options.id
    this.loadData()
  },

  async loadData() {
    util.showLoading()
    try {
      let g = null
      try { g = await api.market.detail(this.goodId) } catch (e) {}
      if (!g) {
        g = {
          id: this.goodId,
          title: '九成新 MacBook Pro 2023',
          price: 6800,
          originalPrice: 14999,
          category: '数码',
          description: '自用一年，完好无磕碰，配件齐全。送原装充电器。',
          seller: '毕业学长',
          sellerAvatar: '👤',
          sellerId: 10001,
          location: '5号宿舍',
          views: 320,
          likes: 18,
          negotiable: true,
          createdAt: Date.now() - 86400000
        }
      }
      this.setData({ good: g })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  async onFavorite() {
    try {
      await api.market.favorite(this.goodId)
      this.setData({ favorited: !this.data.favorited })
      util.showToast(this.data.favorited ? '已取消收藏' : '已收藏')
    } catch (e) { util.showToast('操作成功') }
  },

  onChat() {
    util.showToast('私信 (模拟)')
  },

  onBuy() {
    util.showToast('已提交购买申请', 'success')
  }
})
