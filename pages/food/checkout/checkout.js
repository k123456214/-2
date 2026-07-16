// pages/food/checkout/checkout.js - 订单结算页
const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    shopId: null,
    shopCart: null,
    goods: [],
    totalPrice: 0,
    deliveryFee: 0,
    couponDiscount: 0,
    payPrice: 0,
    address: null,
    remark: '',
    coupons: [],
    myCoupons: [],
    selectedCoupon: null,
    paymentType: 'wechat',
    payMethods: [
      { id: 'wechat', name: '微信支付', icon: '💚' },
      { id: 'balance', name: '余额支付', icon: '💰' },
      { id: 'coupon', name: '优惠券支付', icon: '🎟️' }
    ]
  },

  onLoad(options) {
    this.data.shopId = options.shopId
    this.initData()
    this.loadCoupons()
  },

  initData() {
    const app = getApp()
    const key = 'shop_' + this.data.shopId
    const shopCart = app.globalData.cart[key]
    if (!shopCart || shopCart.goods.length === 0) {
      util.showToast('购物车为空')
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }
    let total = 0
    shopCart.goods.forEach(g => total += g.price * g.count)
    const delivery = shopCart.deliveryFee || 0
    this.setData({
      shopCart,
      goods: shopCart.goods,
      totalPrice: total.toFixed(2),
      deliveryFee: delivery.toFixed(2),
      payPrice: (total + delivery).toFixed(2)
    })
  },

  async loadCoupons() {
    try {
      const [list, mine] = await Promise.all([
        api.coupon.list(),
        api.coupon.myCoupons()
      ])
      this.setData({
        coupons: list || [],
        myCoupons: mine || []
      })
    } catch (e) {}
  },

  onAddressTap() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({ address: { name: res.name, address: res.address, latitude: res.latitude, longitude: res.longitude } })
      },
      fail: () => {
        this.setData({ address: { name: '张同学', phone: '138****8888', address: '3号楼 501室' } })
      }
    })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  onSelectCoupon(e) {
    const id = e.currentTarget.dataset.id
    const coupon = this.data.coupons.find(c => c.id == id) || this.data.myCoupons.find(c => c.id == id)
    if (!coupon) return
    let discount = 0
    const total = parseFloat(this.data.totalPrice)
    if (total < coupon.minOrder) {
      util.showToast('订单金额不足')
      return
    }
    if (coupon.type === '满减') discount = coupon.discount
    else if (coupon.type === '折扣') discount = total * (1 - coupon.discount)
    this.setData({
      selectedCoupon: coupon,
      couponDiscount: discount.toFixed(2),
      payPrice: (total + parseFloat(this.data.deliveryFee) - discount).toFixed(2)
    })
  },

  onPayMethodSelect(e) {
    this.setData({ paymentType: e.currentTarget.dataset.id })
  },

  async onSubmit() {
    if (!this.data.address) {
      util.showToast('请填写收货地址')
      return
    }
    util.showLoading('提交订单中...')
    try {
      const order = await api.order.create({
        shopId: this.data.shopId,
        shopName: this.data.shopCart.shopName,
        goods: this.data.goods,
        totalPrice: this.data.totalPrice,
        deliveryFee: this.data.deliveryFee,
        couponDiscount: this.data.couponDiscount,
        payPrice: this.data.payPrice,
        address: this.data.address,
        remark: this.data.remark,
        paymentType: this.data.paymentType
      })
      // 模拟支付
      await api.order.pay(order.id || order._id || 1)
      // 清空购物车
      const app = getApp()
      delete app.globalData.cart['shop_' + this.data.shopId]
      app.saveCart()
      util.hideLoading()
      wx.showToast({ title: '支付成功', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/food/order-detail/order-detail?id=' + (order.id || 1) })
      }, 1500)
    } catch (e) {
      util.hideLoading()
      console.error(e)
    }
  }
})
