const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: 'mine', name: '我发布的' },
      { id: 'taken', name: '我接的' },
      { id: 'nearby', name: '附近任务' }
    ],
    activeTab: 'nearby',
    tasks: []
  },

  onShow() {
    this.loadTasks()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.loadTasks()
  },

  async loadTasks() {
    util.showLoading()
    try {
      const res = await api.errand.list({ page: 1, pageSize: 50 })
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, title: '顺丰快递代取', type: '取快递', pickup: '南门菜鸟驿站', delivery: '宿舍1号楼 501', fee: 5, status: 0, publisher: '用户A', publisherId: 10001, createdAt: Date.now() - 1800000 },
          { id: 2, title: '东门麦香汉堡点餐', type: '代买', pickup: '麦香汉堡', delivery: '图书馆3楼', fee: 8, status: 1, publisher: '用户B', runnerName: '跑腿小哥', createdAt: Date.now() - 3600000 },
          { id: 3, title: '打印50张文档', type: '打印', pickup: '打印店', delivery: '教学楼B201', fee: 10, status: 0, publisher: '用户C', createdAt: Date.now() - 7200000 },
          { id: 4, title: '帮忙搬个箱子到宿舍', type: '其他', pickup: '东门', delivery: '宿舍3号楼', fee: 15, status: 2, publisher: '用户D', runnerName: '热心同学', createdAt: Date.now() - 86400000 }
        ]
        if (this.data.activeTab === 'mine') {
          list = list.filter(t => t.status === 0 || t.publisher === '用户A')
        } else if (this.data.activeTab === 'taken') {
          list = list.filter(t => t.status >= 1)
        }
      }
      this.setData({ tasks: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/errand/detail/detail?id=' + id })
  },

  async onAccept(e) {
    const id = e.currentTarget.dataset.id
    util.showLoading()
    try {
      await api.errand.accept(id)
      util.hideLoading()
      util.showToast('接单成功', 'success')
      setTimeout(() => wx.navigateTo({ url: '/pages/errand/detail/detail?id=' + id }), 600)
    } catch (e) {
      util.hideLoading()
      util.showToast('接单失败')
    }
  },

  onPublishTap() {
    wx.navigateTo({ url: '/pages/errand/publish/publish' })
  }
})
