const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    pageId: '',
    page: null
  },

  onLoad(options) {
    this.setData({ pageId: options.id || '1' })
    this.loadPage()
  },

  async loadPage() {
    util.showLoading()
    try {
      let p = null
      try { p = await api.diy.detail(this.data.pageId) } catch (e) {}
      if (!p) {
        p = {
          id: this.data.pageId,
          title: '校园风光',
          banner: '',
          components: [
            { type: 'title', content: '欢迎来到我们的校园' },
            { type: 'richtext', content: '<p>这里是充满青春与梦想的地方，在这里每天都有新的故事。</p><p>校园里的每一处都值得被发现。</p>' },
            { type: 'image', src: '', url: '' },
            { type: 'divider' },
            { type: 'text', content: '点击下方按钮，发现更多精彩内容！' },
            { type: 'button', text: '查看论坛', url: '/pages/forum/list/list' },
            { type: 'button', text: '逛逛二手市场', url: '/pages/market/list/list' },
            { type: 'divider' }
          ]
        }
      }
      this.setData({ page: p })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onTapButton(e) {
    const url = e.currentTarget.dataset.url
    if (!url) return
    if (url.startsWith('http')) {
      wx.navigateTo({ url: '/pages/custom/h5/h5?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent('外部链接') })
    } else {
      wx.navigateTo({ url, fail: () => {
        wx.switchTab({ url, fail: () => util.showToast('页面打开失败') })
      }})
    }
  },

  onGoodsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/market/detail/detail?id=' + id })
  }
})
