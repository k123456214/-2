const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    isEdit: false,
    categories: ['主食', '小吃', '饮品', '套餐', '其他'],
    form: {
      id: null,
      name: '',
      price: '',
      originalPrice: '',
      stock: '',
      category: '主食',
      description: ''
    },
    attrs: [],
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, 'form.id': options.id })
      this.loadGoods(options.id)
    }
  },

  async loadGoods(id) {
    util.showLoading()
    try {
      const g = await api.goods.detail(id)
      if (g) {
        this.setData({
          form: {
            id: g.id, name: g.name || '',
            price: String(g.price || ''),
            originalPrice: String(g.originalPrice || ''),
            stock: String(g.stock || ''),
            category: g.category || '主食',
            description: g.description || ''
          },
          attrs: (g.attrs || []).map(a => ({
            name: a.name || '',
            type: a.type || 'select',
            options: a.options ? a.options.join(',') : '',
            min: a.min != null ? String(a.min) : '',
            max: a.max != null ? String(a.max) : '',
            required: !!a.required,
            extraPrice: a.pricePerAddon ? String(a.pricePerAddon) : ''
          }))
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
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

  addAttr() {
    const attrs = this.data.attrs.slice()
    attrs.push({
      name: '', type: 'select', options: '',
      min: '', max: '', required: false, extraPrice: ''
    })
    this.setData({ attrs })
  },

  onAttrInput(e) {
    const idx = e.currentTarget.dataset.idx
    const key = e.currentTarget.dataset.key
    const attrs = this.data.attrs.slice()
    attrs[idx][key] = e.detail.value
    this.setData({ attrs })
  },

  onAttrTypeTap(e) {
    const idx = e.currentTarget.dataset.idx
    const type = e.currentTarget.dataset.type
    const attrs = this.data.attrs.slice()
    attrs[idx].type = type
    this.setData({ attrs })
  },

  toggleAttrRequired(e) {
    const idx = e.currentTarget.dataset.idx
    const attrs = this.data.attrs.slice()
    attrs[idx].required = !attrs[idx].required
    this.setData({ attrs })
  },

  removeAttr(e) {
    const idx = e.currentTarget.dataset.idx
    const attrs = this.data.attrs.slice()
    attrs.splice(idx, 1)
    this.setData({ attrs })
  },

  async onSubmit() {
    const f = this.data.form
    if (!f.name) return util.showToast('请输入商品名称')
    if (!f.price || isNaN(parseFloat(f.price))) return util.showToast('请输入正确的价格')
    if (f.stock === '' || isNaN(parseInt(f.stock))) return util.showToast('请输入库存')

    this.setData({ submitting: true })
    util.showLoading('提交中...')
    try {
      const payload = {
        ...f,
        price: parseFloat(f.price),
        originalPrice: f.originalPrice ? parseFloat(f.originalPrice) : null,
        stock: parseInt(f.stock),
        attrs: this.data.attrs.map(a => {
          const r = { name: a.name, type: a.type, required: a.required }
          if (a.type === 'select' || a.type === 'multiselect') {
            r.options = a.options ? a.options.split(/[,，]/).map(s => s.trim()).filter(Boolean) : []
            if (a.type === 'multiselect' && a.extraPrice) r.pricePerAddon = parseFloat(a.extraPrice)
          }
          if (a.type === 'number') {
            if (a.min !== '') r.min = parseInt(a.min)
            if (a.max !== '') r.max = parseInt(a.max)
          }
          return r
        })
      }
      if (this.data.isEdit && f.id) {
        await api.goods.update(f.id, payload)
      } else {
        await api.goods.create(payload)
      }
      util.hideLoading()
      wx.showModal({
        title: '成功',
        content: '商品已保存',
        showCancel: false,
        success: () => wx.navigateBack()
      })
    } catch (e) {
      util.hideLoading()
      util.showToast('保存失败')
    } finally {
      this.setData({ submitting: false })
    }
  },

  onImageTap() {
    util.showToast('图片上传 (模拟)')
  }
})
