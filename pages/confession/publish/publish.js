const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    form: {
      content: '',
      isAnonymous: true
    },
    submitting: false
  },

  onInput(e) {
    const form = { ...this.data.form, content: e.detail.value }
    this.setData({ form })
  },

  toggleAnonymous() {
    const form = { ...this.data.form, isAnonymous: !this.data.form.isAnonymous }
    this.setData({ form })
  },

  async onSubmit() {
    if (!this.data.form.content.trim()) return util.showToast('请输入内容')
    this.setData({ submitting: true })
    util.showLoading()
    try {
      await api.confession.create(this.data.form)
      util.hideLoading()
      wx.showModal({
        title: '提交成功',
        content: '您的表白已提交，感谢分享',
        showCancel: false,
        success: () => wx.navigateBack()
      })
    } catch (e) {
      util.hideLoading()
      util.showToast('提交失败')
    } finally {
      this.setData({ submitting: false })
    }
  }
})
