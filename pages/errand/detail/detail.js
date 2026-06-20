const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    task: null
  },

  onLoad(options) {
    this.taskId = options.id
    this.loadTask()
  },

  async loadTask() {
    util.showLoading()
    try {
      let t = null
      try { t = await api.errand.detail(this.taskId) } catch (e) {}
      if (!t) {
        t = {
          id: this.taskId,
          title: '顺丰快递代取',
          type: '取快递',
          pickup: '南门菜鸟驿站',
          delivery: '宿舍1号楼 501',
          fee: 5,
          status: 0,
          publisher: '用户A',
          publisherPhone: '138****1111',
          runnerName: '',
          runnerPhone: '',
          description: '快递码 123-45-678，物品是一个盒子，体积不大',
          createdAt: Date.now() - 1800000,
          pickupLat: 39.908823,
          pickupLng: 116.397470,
          deliveryLat: 39.910,
          deliveryLng: 116.400,
          logs: [
            { time: Date.now() - 1800000, text: '任务发布' }
          ]
        }
      }
      this.setData({ task: t })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  async onAccept() {
    util.showLoading()
    try {
      await api.errand.accept(this.taskId)
      const task = { ...this.data.task, status: 1, runnerName: '我' }
      this.setData({ task })
      util.hideLoading()
      util.showToast('接单成功', 'success')
    } catch (e) {
      util.hideLoading()
      util.showToast('操作失败')
    }
  },

  async onComplete() {
    util.showLoading()
    try {
      await api.errand.complete(this.taskId)
      const task = { ...this.data.task, status: 2 }
      this.setData({ task })
      util.hideLoading()
      util.showToast('已完成', 'success')
    } catch (e) {
      util.hideLoading()
      util.showToast('操作失败')
    }
  },

  onCancel() {
    wx.showModal({
      title: '提示',
      content: '确认取消任务？',
      success: (res) => {
        if (res.confirm) {
          const task = { ...this.data.task, status: 3 }
          this.setData({ task })
          util.showToast('已取消')
        }
      }
    })
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) wx.makePhoneCall({ phoneNumber: phone, fail: () => util.showToast('呼叫失败') })
  },

  onShowMap() {
    util.showToast('地图导航 (模拟)')
  }
})
