const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    categories: ['数码', '书籍', '服饰', '生活用品', '其他'],
    form: {
      title: '',
      description: '',
      category: '数码',
      originalPrice: '',
      price: '',
      negotiable: true,
      location: ''
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

  toggleNegotiable() {
    const form = { ...this.data.form, negotiable: !this.data.form.negotiable }
    this.setData({ form })
  },

  onUpload(e) {
    util.showToast('图片上传 (模拟)')
  },

  async onSubmit() {
    const f = this.data.form
    if (!f.title) return util.showToast('请输入标题')
    if (!f.description) return util.showToast('请输入描述')
    if (!f.price) return util.showToast('请输入价格')

    this.setData({ submitting: true })
    util.showLoading()
    try {
      await api.market.create(f)
      util.hideLoading()
      wx.showModal({
        title: '发布成功',
        content: '您的商品已发布',
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
