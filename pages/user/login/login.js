const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    mode: 'wx',
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    role: 'user',
    agree: true,
    countdown: 0,
    roles: [
      { id: 'user', name: '普通用户' },
      { id: 'merchant', name: '商户' },
      { id: 'admin', name: '管理员' }
    ]
  },

  onLoad() {
    const app = getApp()
    if (app.globalData.token) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode })
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

  toggleAgree() {
    this.setData({ agree: !this.data.agree })
  },

  sendCode() {
    if (!/^1\d{10}$/.test(this.data.phone)) {
      util.showToast('请输入正确的手机号')
      return
    }
    util.showToast('验证码已发送')
    this.setData({ countdown: 60 })
    this.timer && clearInterval(this.timer)
    this.timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(this.timer)
        this.setData({ countdown: 0 })
      } else {
        this.setData({ countdown: this.data.countdown - 1 })
      }
    }, 1000)
  },

  async wxLogin() {
    util.showLoading('登录中...')
    try {
      const res = await api.user.login({ code: 'wx_' + Date.now(), role: this.data.role })
      this._saveLogin({ token: res.token, info: { ...res.info, role: this.data.role } })
    } catch (e) {
      this._mockLogin()
    }
  },

  phoneLogin() {
    if (!/^1\d{10}$/.test(this.data.phone)) {
      util.showToast('请输入正确的手机号')
      return
    }
    if (!this.data.code) {
      util.showToast('请输入验证码')
      return
    }
    if (!this.data.agree) {
      util.showToast('请同意用户协议')
      return
    }
    this._mockLogin()
  },

  register() {
    if (!this.data.nickname) { util.showToast('请输入昵称'); return }
    if (!/^1\d{10}$/.test(this.data.phone)) { util.showToast('请输入正确的手机号'); return }
    if (this.data.password.length < 6) { util.showToast('密码至少6位'); return }
    if (this.data.password !== this.data.confirmPassword) { util.showToast('两次密码不一致'); return }
    if (!this.data.agree) { util.showToast('请同意用户协议'); return }
    this._mockLogin()
  },

  async _mockLogin() {
    util.showLoading('登录中...')
    try {
      const app = getApp()
      const userInfo = {
        id: 10001,
        nickname: this.data.nickname || '校园用户',
        avatar: '/images/default-avatar.png',
        phone: this.data.phone || '138****8888',
        role: this.data.role,
        level: 1,
        points: 100
      }
      app.globalData.token = 'mock_' + Date.now()
      app.globalData.userInfo = userInfo
      app.globalData.role = this.data.role
      const storage = require('../../../utils/storage.js')
      storage.set('token', app.globalData.token)
      storage.set('userInfo', userInfo)
      util.hideLoading()
      util.showToast('登录成功', 'success')
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          wx.navigateBack()
        } else {
          wx.switchTab({ url: '/pages/index/index' })
        }
      }, 800)
    } catch (e) {
      util.hideLoading()
      util.showToast('登录失败')
    }
  },

  _saveLogin(data) {
    const app = getApp()
    app.globalData.token = data.token
    app.globalData.userInfo = data.info
    app.globalData.role = data.info.role
    const storage = require('../../../utils/storage.js')
    storage.set('token', data.token)
    storage.set('userInfo', data.info)
    util.hideLoading()
    util.showToast('登录成功', 'success')
    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({ url: '/pages/index/index' })
      }
    }, 800)
  }
})
