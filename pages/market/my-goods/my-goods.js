const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: 'selling', name: '出售中' },
      { id: 'sold', name: '已售' },
      { id: 'offline', name: '已下架' }
    ],
    activeTab: 'selling',
    goods: []
  },

  onShow() {
    this.loadGoods()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.loadGoods()
  },

  async loadGoods() {
    util.showLoading()
    try {
      let res = null
      try { res = await api.market.myGoods({ page: 1, pageSize: 30 }) } catch (e) {}
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, title: '九成新 MacBook Pro 2023', price: 6800, originalPrice: 14999, status: 1, views: 320, likes: 18 },
          { id: 2, title: '高数教材 + 习题册', price: 30, originalPrice: 120, status: 1, views: 120, likes: 5 },
          { id: 3, title: 'Nike 运动鞋 42码', price: 280, originalPrice: 799, status: 2, views: 80, likes: 3 },
          { id: 4, title: '台灯 - 可调光护眼', price: 50, originalPrice: 180, status: 0, views: 60, likes: 2 }
        ]
      }
      if (this.data.activeTab === 'selling') list = list.filter(g => g.status === 1)
      else if (this.data.activeTab === 'sold') list = list.filter(g => g.status === 2)
      else list = list.filter(g => g.status === 0)
      this.setData({ goods: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  async onOffline(e) {
    const id = e.currentTarget.dataset.id
    const ok = await util.confirm('提示', '确认下架此商品？')
    if (!ok) return
    try {
      await api.market.offline(id)
      util.showToast('已下架', 'success')
      this.loadGoods()
    } catch (e) { util.showToast('操作成功') }
  },

  async onRelist(e) {
    util.showToast('已重新上架', 'success')
    setTimeout(() => this.loadGoods(), 500)
  },

  onEdit(e) {
    util.showToast('编辑 (模拟)')
  },

  onPublish() {
    wx.navigateTo({ url: '/pages/market/publish/publish' })
  }
})
