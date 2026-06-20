const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    goods: []
  },

  onShow() {
    this.loadGoods()
  },

  async loadGoods() {
    util.showLoading()
    try {
      const res = await api.goods.list({ page: 1, pageSize: 50 })
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, name: '经典牛肉汉堡', price: 28, originalPrice: 35, stock: 80, sales: 520, status: 1 },
          { id: 2, name: '珍珠奶茶', price: 15, originalPrice: 18, stock: 200, sales: 620, status: 1 },
          { id: 3, name: '薯条(大)', price: 12, originalPrice: 15, stock: 100, sales: 420, status: 1 },
          { id: 4, name: '双层芝士堡', price: 22, originalPrice: 26, stock: 50, sales: 310, status: 0 }
        ]
      }
      this.setData({ goods: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/merchant/goods-edit/goods-edit?id=' + id })
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/merchant/goods-edit/goods-edit' })
  },

  async onToggle(e) {
    const id = e.currentTarget.dataset.id
    const idx = e.currentTarget.dataset.idx
    const item = this.data.goods[idx]
    const newStatus = item.status === 1 ? 0 : 1
    try {
      await api.goods.toggleStatus(id, newStatus)
      const list = this.data.goods.slice()
      list[idx].status = newStatus
      this.setData({ goods: list })
      util.showToast(newStatus === 1 ? '已上架' : '已下架', 'success')
    } catch (e) {
      util.showToast('操作失败')
    }
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id
    const ok = await util.confirm('提示', '确认删除此商品？')
    if (!ok) return
    try {
      await api.goods.delete(id)
      const list = this.data.goods.filter(g => g.id !== id)
      this.setData({ goods: list })
      util.showToast('已删除', 'success')
    } catch (e) {
      util.showToast('删除失败')
    }
  }
})
