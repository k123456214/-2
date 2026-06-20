const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    userInfo: null,
    levelInfo: null,
    orderCount: { paid: 0, making: 0, delivering: 0, done: 0 }
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo })
    } else {
      this.loadUserInfo()
    }
  },

  async loadUserInfo() {
    try {
      const [profile, level, orders] = await Promise.all([
        api.user.profile(),
        api.user.levelInfo(),
        api.order.list({ page: 1, pageSize: 100 })
      ])
      const app = getApp()
      const info = profile || app.globalData.userInfo || {
        id: 10001, nickname: '校园用户', avatar: '', phone: '138****8888',
        role: 'user', level: 1, points: 100
      }
      const orderList = orders && orders.list ? orders.list : []
      const count = {
        paid: orderList.filter(o => o.status == 1).length,
        making: orderList.filter(o => o.status == 2).length,
        delivering: orderList.filter(o => o.status == 3).length,
        done: orderList.filter(o => o.status == 4).length
      }
      app.globalData.userInfo = info
      this.setData({ userInfo: info, levelInfo: level, orderCount: count })
    } catch (e) {
      const app = getApp()
      this.setData({ userInfo: app.globalData.userInfo })
    }
  },

  onLoginTap() {
    wx.navigateTo({ url: '/pages/user/login/login' })
  },

  onOrderTap(e) {
    const status = e.currentTarget.dataset.status
    wx.navigateTo({ url: '/pages/user/order/my-order?status=' + status })
  },

  onAllOrderTap() {
    wx.navigateTo({ url: '/pages/user/order/my-order' })
  },

  onCouponTap() {
    wx.navigateTo({ url: '/pages/user/coupon/coupon' })
  },

  onFavoriteTap() {
    wx.navigateTo({ url: '/pages/user/favorite/favorite' })
  },

  onAddressTap() {
    util.showToast('地址管理')
  },

  onApplyTap() {
    wx.navigateTo({ url: '/pages/merchant/apply/apply' })
  },

  onMerchantTap() {
    wx.navigateTo({ url: '/pages/merchant/my-shop/my-shop' })
  },

  onServiceTap(e) {
    const name = e.currentTarget.dataset.name
    util.showToast(name + ' (开发中)')
  },

  onSettingsTap() {
    wx.navigateTo({ url: '/pages/user/settings/settings' })
  },

  onEditProfile() {
    if (!this.data.userInfo) {
      this.onLoginTap()
      return
    }
    wx.navigateTo({ url: '/pages/user/settings/settings' })
  }
})
