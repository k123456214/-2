// pages/food/shop/shop.js - 商户店铺页面（含属性多规格/数字选择）
const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    shop: null,
    goods: [],
    categories: [],
    activeCat: 0,
    cart: {},
    totalCount: 0,
    totalPrice: 0,
    showCart: false,
    showAttr: false,
    currentGoods: null,
    selectedAttrs: {}, // { attrName: { type, value(s) } }
    currentAttrPrice: 0,
    currentGoodsCount: 1,
    shopCategories: []
  },

  onLoad(options) {
    this.shopId = options.shopId
    this.loadShop()
  },

  async loadShop() {
    util.showLoading()
    try {
      const shop = await api.merchant.detail(this.shopId)
      // 整理分类
      const cats = [{ id: 0, name: '全部' }]
      const goodsList = shop.goods || []
      const catMap = {}
      goodsList.forEach(g => {
        if (!catMap[g.categoryId]) {
          catMap[g.categoryId] = { id: g.categoryId, name: '分类' + g.categoryId }
        }
      })
      Object.values(catMap).forEach(c => cats.push(c))
      this.setData({
        shop,
        goods: goodsList,
        categories: cats,
        shopCategories: cats
      })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onCatTap(e) {
    this.setData({ activeCat: e.currentTarget.dataset.idx })
  },

  // 打开商品详情 - 显示属性选择弹窗
  onGoodsTap(e) {
    const id = e.currentTarget.dataset.id
    const goods = this.data.goods.find(g => g.id == id)
    if (!goods) return
    if (goods.attrs && goods.attrs.length) {
      // 初始化属性选择
      const selected = {}
      let extraPrice = 0
      goods.attrs.forEach(attr => {
        if (attr.type === 'select') {
          selected[attr.name] = { type: 'select', value: attr.options && attr.options[0] || '' }
        } else if (attr.type === 'multiselect') {
          selected[attr.name] = { type: 'multiselect', values: [] }
        } else if (attr.type === 'number') {
          selected[attr.name] = { type: 'number', value: attr.default || attr.min || 1 }
        } else if (attr.type === 'text') {
          selected[attr.name] = { type: 'text', value: '' }
        }
      })
      this.setData({
        showAttr: true,
        currentGoods: goods,
        selectedAttrs: selected,
        currentAttrPrice: 0,
        currentGoodsCount: 1
      })
    } else {
      this.addToCart(goods, 1, {}, 0)
    }
  },

  // 选择单选属性
  onSelectAttr(e) {
    const { name, value } = e.currentTarget.dataset
    const selected = this.data.selectedAttrs
    selected[name].value = value
    this.recalcPrice(selected)
    this.setData({ selectedAttrs: selected })
  },

  // 切换多选属性
  onMultiAttrTap(e) {
    const { name, value } = e.currentTarget.dataset
    const selected = this.data.selectedAttrs
    const sel = selected[name]
    const idx = sel.values.indexOf(value)
    const attrs = this.data.currentGoods.attrs.find(a => a.name === name)
    if (idx >= 0) {
      sel.values.splice(idx, 1)
    } else {
      if (attrs.maxSelect && sel.values.length >= attrs.maxSelect) {
        util.showToast('最多可选' + attrs.maxSelect + '项')
        return
      }
      sel.values.push(value)
    }
    this.recalcPrice(selected)
    this.setData({ selectedAttrs: selected })
  },

  // 数字增减
  onNumberChange(e) {
    const { name, action } = e.currentTarget.dataset
    const selected = this.data.selectedAttrs
    const attrs = this.data.currentGoods.attrs.find(a => a.name === name)
    let v = parseInt(selected[name].value) || attrs.min || 0
    const step = attrs.step || 1
    if (action === 'plus') v += step
    else v -= step
    if (attrs.min !== undefined && v < attrs.min) v = attrs.min
    if (attrs.max !== undefined && v > attrs.max) v = attrs.max
    selected[name].value = v
    this.recalcPrice(selected)
    this.setData({ selectedAttrs: selected })
  },

  // 文本输入
  onTextInput(e) {
    const name = e.currentTarget.dataset.name
    const selected = this.data.selectedAttrs
    selected[name].value = e.detail.value
    this.setData({ selectedAttrs: selected })
  },

  // 计算附加价格
  recalcPrice(selected) {
    let extra = 0
    const goods = this.data.currentGoods
    goods.attrs.forEach(attr => {
      if (attr.type === 'multiselect' && attr.pricePerAddon) {
        extra += selected[attr.name].values.length * attr.pricePerAddon
      }
    })
    this.setData({ currentAttrPrice: extra })
  },

  onGoodsCountChange(e) {
    const action = e.currentTarget.dataset.action
    let count = this.data.currentGoodsCount
    if (action === 'plus') count++
    else if (count > 1) count--
    this.setData({ currentGoodsCount: count })
  },

  onConfirmAdd() {
    const goods = this.data.currentGoods
    // 校验必填
    for (const attr of goods.attrs) {
      const sel = this.data.selectedAttrs[attr.name]
      if (attr.required) {
        if (attr.type === 'select' && !sel.value) {
          util.showToast('请选择' + attr.name); return
        }
        if (attr.type === 'multiselect' && sel.values.length === 0) {
          util.showToast('请选择' + attr.name); return
        }
      }
    }
    this.addToCart(goods, this.data.currentGoodsCount, this.data.selectedAttrs, this.data.currentAttrPrice)
    this.setData({ showAttr: false })
  },

  addToCart(goods, count, attrs, extraPrice) {
    const app = getApp()
    const cart = app.globalData.cart
    const key = 'shop_' + this.shopId
    const attrKey = JSON.stringify(attrs)
    if (!cart[key]) {
      cart[key] = {
        shopId: this.shopId,
        shopName: this.data.shop.name,
        goods: [],
        selected: true,
        deliveryFee: this.data.shop.deliveryFee || 0,
        minOrder: this.data.shop.minOrder || 0
      }
    }
    // 查找同属性商品
    const exist = cart[key].goods.find(g => g.id === goods.id && g.attrKey === attrKey)
    const finalPrice = (parseFloat(goods.price) + extraPrice).toFixed(2)
    if (exist) {
      exist.count += count
    } else {
      cart[key].goods.push({
        id: goods.id,
        name: goods.name,
        price: finalPrice,
        count: count,
        attrs: attrs,
        attrKey: attrKey,
        spec: this.attrsToText(attrs)
      })
    }
    app.saveCart()
    this.refreshCart()
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  attrsToText(attrs) {
    const parts = []
    Object.keys(attrs).forEach(k => {
      const a = attrs[k]
      if (a.type === 'select' && a.value) parts.push(a.value)
      if (a.type === 'multiselect' && a.values.length) parts.push(a.values.join('/'))
      if (a.type === 'number' && a.value !== undefined && a.value !== '') parts.push(k + ':' + a.value)
      if (a.type === 'text' && a.value) parts.push(a.value)
    })
    return parts.join('，')
  },

  refreshCart() {
    const app = getApp()
    const key = 'shop_' + this.shopId
    const shopCart = app.globalData.cart[key] || { goods: [] }
    let totalCount = 0, totalPrice = 0
    shopCart.goods.forEach(g => { totalCount += g.count; totalPrice += g.price * g.count })
    this.setData({
      cart: shopCart,
      totalCount,
      totalPrice: totalPrice.toFixed(2)
    })
  },

  toggleCart() {
    if (this.data.totalCount === 0) return
    this.setData({ showCart: !this.data.showCart })
  },

  onCartGoodsCount(e) {
    const idx = e.currentTarget.dataset.idx
    const action = e.currentTarget.dataset.action
    const app = getApp()
    const key = 'shop_' + this.shopId
    const cart = app.globalData.cart[key]
    if (!cart) return
    if (action === 'plus') cart.goods[idx].count++
    else {
      cart.goods[idx].count--
      if (cart.goods[idx].count <= 0) cart.goods.splice(idx, 1)
    }
    if (cart.goods.length === 0) {
      delete app.globalData.cart[key]
      this.setData({ showCart: false })
    }
    app.saveCart()
    this.refreshCart()
  },

  clearCart() {
    const app = getApp()
    delete app.globalData.cart['shop_' + this.shopId]
    app.saveCart()
    this.refreshCart()
    this.setData({ showCart: false })
  },

  goCheckout() {
    if (parseFloat(this.data.totalPrice) < (this.data.cart.minOrder || 0)) {
      util.showToast('差¥' + ((this.data.cart.minOrder - this.data.totalPrice).toFixed(2)) + '起送')
      return
    }
    wx.navigateTo({ url: '/pages/food/checkout/checkout?shopId=' + this.shopId })
  },

  closeModal() {
    this.setData({ showAttr: false, showCart: false })
  },

  onShow() {
    if (this.shopId) this.refreshCart()
  }
})
