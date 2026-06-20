const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    categories: ['餐饮', '零售', '服务', '其他'],
    form: {
      name: '',
      legalName: '',
      idCard: '',
      phone: '',
      category: '餐饮',
      address: '',
      description: ''
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
    if (!f.name) return util.showToast('请输入店铺名称')
    if (!f.legalName) return util.showToast('请输入法人姓名')
    if (!f.idCard) return util.showToast('请输入身份证号')
    if (!/^1\d{10}$/.test(f.phone)) return util.showToast('请输入正确手机号')
    if (!f.address) return util.showToast('请输入店铺地址')

    this.setData({ submitting: true })
    util.showLoading('提交中...')
    try {
      await api.merchant.apply(f)
      util.hideLoading()
      wx.showModal({
        title: '提交成功',
        content: '您的入驻申请已提交，预计1-3个工作日内审核完成',
        showCancel: false,
        success: () => wx.navigateBack()
      })
    } catch (e) {
      util.hideLoading()
      util.showToast('提交失败，请重试')
    } finally {
      this.setData({ submitting: false })
    }
  },

  onUpload(e) {
    const type = e.currentTarget.dataset.type
    util.showToast('已模拟上传 ' + type)
  }
})
