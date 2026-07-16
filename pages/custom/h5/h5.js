const util = require('../../../utils/util.js')

Page({
  data: {
    url: '',
    title: ''
  },

  onLoad(options) {
    this.setData({
      url: decodeURIComponent(options.url || ''),
      title: decodeURIComponent(options.title || '外部链接')
    })
    wx.setNavigationBarTitle({ title: this.data.title })
  },

  onWebError() {
    util.showToast('页面加载失败，请在浏览器中打开')
  },

  onCopy() {
    wx.setClipboardData({ data: this.data.url })
  },

  onShareAppMessage() {
    return {
      title: this.data.title,
      path: '/pages/custom/h5/h5?url=' + encodeURIComponent(this.data.url) + '&title=' + encodeURIComponent(this.data.title)
    }
  }
})
