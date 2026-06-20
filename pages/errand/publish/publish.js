const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    types: ['取快递', '代买', '打印', '其他'],
    form: {
      type: '取快递',
      pickup: '',
      delivery: '',
      description: '',
      fee: ''
    },
    submitting: false
  },

  onTypeTap(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ 'form.type': this.data.types[idx] })
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const form = { ...this.data.form }
    form[key] = e.detail.value
    this.setData({ form })
  },

  onPickup() {
    util.showToast('选择地点 (模拟)')
  },

  onDelivery() {
    util.showToast('选择送达地点 (模拟)')
  },

  async onSubmit() {
    const f = this.data.form
    if (!f.pickup) return util.showToast('请输入取件地址')
    if (!f.delivery) return util.showToast('请输入送达地址')
    if (!f.description) return util.showToast('请输入任务描述')
    if (!f.fee || isNaN(parseFloat(f.fee))) return util.showToast('请输入费用')

    this.setData({ submitting: true })
    util.showLoading()
    try {
      await api.errand.create({
        ...f,
        fee: parseFloat(f.fee)
      })
      util.hideLoading()
      wx.showModal({
        title: '发布成功',
        content: '任务已发布，等待跑腿员接单',
        showCancel: false,
        success: () => wx.navigateBack()
      })
    } catch (e) {
      util.hideLoading()
      util.showToast('发布失败')
    } finally {
      this.setData({ submitting: false })
    }
  }
})
