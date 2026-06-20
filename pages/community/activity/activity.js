const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    activities: []
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    util.showLoading()
    try {
      let res = null
      try { res = await api.community.activities({ page: 1, pageSize: 50 }) } catch (e) {}
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, title: '新生杯篮球赛', location: '校园体育馆', startTime: Date.now() + 86400000, signupCount: 42, capacity: 100, fee: 0, description: '面向新生的篮球比赛活动', signed: false },
          { id: 2, title: 'Hackathon 编程马拉松', location: '创新大楼301', startTime: Date.now() + 86400000 * 3, signupCount: 88, capacity: 120, fee: 0, description: '48小时开发挑战', signed: true },
          { id: 3, title: '校园风景摄影分享', location: '艺术楼', startTime: Date.now() + 86400000 * 2, signupCount: 25, capacity: 50, fee: 10, description: '分享你的摄影作品', signed: false }
        ]
      }
      this.setData({ activities: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  async onSignup(e) {
    const id = e.currentTarget.dataset.id
    const idx = e.currentTarget.dataset.idx
    util.showLoading()
    try {
      await api.community.activitySignup(id)
      const list = this.data.activities.slice()
      list[idx].signed = true
      list[idx].signupCount = (list[idx].signupCount || 0) + 1
      this.setData({ activities: list })
      util.hideLoading()
      util.showToast('报名成功', 'success')
    } catch (e) {
      util.hideLoading()
      util.showToast('报名失败')
    }
  }
})
