const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    userInfo: null,
    nickname: '',
    phone: '',
    role: 'user',
    roles: [
      { id: 'user', name: '普通用户' },
      { id: 'merchant', name: '商户' },
      { id: 'admin', name: '管理员' }
    ],
    cacheSize: '0 KB'
  },

  onLoad() {
    const app = getApp()
    const info = app.globalData.userInfo || { nickname: '校园用户', phone: '138****8888', role: 'user' }
    this.setData({
      userInfo: info,
      nickname: info.nickname,
      phone: info.phone,
      role: info.role || 'user'
    })
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const data = {}
    data[key] = e.detail.value
    this.setData(data)
  },

  onRoleTap(e) {
    this.setData({ role: e.currentTarget.dataset.role })
  },

  async saveProfile() {
    if (!this.data.nickname) {
      util.showToast('请输入昵称')
      return
    }
    util.showLoading('保存中...')
    try {
      const app = getApp()
      const info = {
        ...(app.globalData.userInfo || {}),
        nickname: this.data.nickname,
        phone: this.data.phone,
        role: this.data.role
      }
      app.globalData.userInfo = info
      app.globalData.role = this.data.role
      const storage = require('../../../utils/storage.js')
      storage.set('userInfo', info)
      this.setData({ userInfo: info })
      util.hideLoading()
      util.showToast('保存成功', 'success')
    } catch (e) {
      util.hideLoading()
      util.showToast('保存失败')
    }
  },

  onAddressTap() {
    util.showToast('地址管理')
  },

  onMessageTap() {
    util.showToast('消息通知设置')
  },

  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确认清除缓存？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
          } catch (e) {}
          util.showToast('缓存已清除', 'success')
        }
      }
    })
  },

  onAbout() {
    util.showToast('校园综合服务 v1.0.0')
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.globalData.token = ''
          app.globalData.userInfo = null
          const storage = require('../../../utils/storage.js')
          storage.remove('token')
          storage.remove('userInfo')
          util.showToast('已退出登录')
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/user/login/login' })
          }, 800)
        }
      }
    })
  }
})
