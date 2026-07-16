// utils/auth.js - 登录授权封装
const storage = require('./storage.js')

module.exports = {
  // 模拟微信登录
  mockLogin(code) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock_token_' + Date.now(),
          info: {
            id: 10001,
            nickname: '校园用户',
            avatar: '/images/default-avatar.png',
            phone: '138****8888',
            role: 'user',
            level: 1,
            points: 100,
            balance: 0
          }
        })
      }, 300)
    })
  },

  // 获取微信用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => resolve(res.userInfo),
        fail: reject
      })
    })
  },

  // 检查是否有登录
  isLogin() {
    return !!storage.get('token')
  },

  // 切换角色（用于演示商户/管理员）
  switchRole(role) {
    const userInfo = storage.get('userInfo') || {}
    userInfo.role = role
    storage.set('userInfo', userInfo)
    const app = getApp()
    app.globalData.role = role
    app.globalData.userInfo = userInfo
  }
}
