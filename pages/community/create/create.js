const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    categories: ['运动', '科技', '艺术', '音乐', '其他'],
    form: {
      name: '',
      category: '运动',
      description: '',
      announcement: ''
    },
    submitting: false
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const form = { ...this.data.form }
    form[key] = e.detail.value
    this.setData({ form })
  },

  onCatTap(e) {
    const idx = e.currentTarget.dataset.idx
    const form = { ...this.data.form, category: this.data.categories[idx] }
    this.setData({ form })
  },

  async onSubmit() {
    const f = this.data.form
    if (!f.name) return util.showToast('请输入社区名称')
    if (!f.description) return util.showToast('请输入社区简介')

    this.setData({ submitting: true })
    util.showLoading()
    try {
      await api.community.create(f)
      util.hideLoading()
      wx.showModal({
        title: '提交成功',
        content: '社区已创建，可以开始招募成员了',
        showCancel: false,
        success: () => wx.navigateBack()
      })
    } catch (e) {
      util.hideLoading()
      util.showToast('创建失败')
    } finally {
      this.setData({ submitting: false })
    }
  }
})
