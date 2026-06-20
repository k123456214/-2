// app.js - 小程序全局入口
const api = require('./utils/api.js')
const storage = require('./utils/storage.js')
const auth = require('./utils/auth.js')

App({
  globalData: {
    userInfo: null,
    token: '',
    role: 'user', // user | merchant | admin
    location: null,
    systemInfo: null,
    apiBase: 'https://api.campus.example.com',
    version: '1.0.0',
    // 购物车 { shopId: { shopName, goods: [{id,name,price,spec,count}], selected: true } }
    cart: {}
  },

  onLaunch(options) {
    // 系统信息
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync()
    } catch (e) {}

    // 恢复登录状态
    const token = storage.get('token')
    const userInfo = storage.get('userInfo')
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.role = userInfo.role || 'user'
    }

    // 恢复购物车
    const cart = storage.get('cart')
    if (cart) this.globalData.cart = cart

    // 获取定位
    this.getLocation()

    // 检查登录状态
    this.checkLoginStatus()

    // 场景值处理
    if (options.scene) {
      console.log('场景值:', options.scene)
    }
  },

  onShow(options) {
    // 页面显示时刷新用户信息
    if (this.globalData.token) {
      // 可选：刷新用户信息
    }
  },

  onError(msg) {
    console.error('小程序错误:', msg)
  },

  // 获取定位
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.globalData.location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
      },
      fail: () => {
        // 默认位置（校园中心）
        this.globalData.location = {
          latitude: 39.908823,
          longitude: 116.397470
        }
      }
    })
  },

  // 检查登录状态
  checkLoginStatus() {
    if (!this.globalData.token) return
    // 可调用后端校验token有效性
  },

  // 登录
  login(cb) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 模拟登录（实际应发送到后端换取token）
          auth.mockLogin(res.code).then((user) => {
            this.globalData.token = user.token
            this.globalData.userInfo = user.info
            this.globalData.role = user.info.role
            storage.set('token', user.token)
            storage.set('userInfo', user.info)
            cb && cb(user)
          })
        }
      }
    })
  },

  // 登出
  logout() {
    this.globalData.token = ''
    this.globalData.userInfo = null
    this.globalData.role = 'user'
    storage.remove('token')
    storage.remove('userInfo')
  },

  // 需要登录的操作
  requireLogin(cb) {
    if (this.globalData.token) {
      cb && cb()
    } else {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/user/login/login' })
          }
        }
      })
    }
  },

  // 保存购物车
  saveCart() {
    storage.set('cart', this.globalData.cart)
  }
})
