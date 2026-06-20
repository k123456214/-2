// utils/storage.js - 本地存储封装
module.exports = {
  set(key, value) {
    try {
      wx.setStorageSync(key, value)
    } catch (e) {
      console.error('storage.set error:', e)
    }
  },

  get(key, defaultValue = null) {
    try {
      const v = wx.getStorageSync(key)
      return v !== '' ? v : defaultValue
    } catch (e) {
      return defaultValue
    }
  },

  remove(key) {
    try {
      wx.removeStorageSync(key)
    } catch (e) {}
  },

  clear() {
    try {
      wx.clearStorageSync()
    } catch (e) {}
  }
}
