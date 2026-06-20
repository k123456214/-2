const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: 'latest', name: '最新' },
      { id: 'hot', name: '热门' }
    ],
    activeTab: 'latest',
    confessions: []
  },

  onShow() {
    this.loadList()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.loadList()
  },

  async loadList() {
    util.showLoading()
    try {
      let res = null
      try {
        if (this.data.activeTab === 'hot') {
          res = await api.confession.hot({ page: 1, pageSize: 30 })
        } else {
          res = await api.confession.list({ page: 1, pageSize: 30 })
        }
      } catch (e) {}
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, content: '图书馆三楼靠窗第三排的女生，每天都能看到你专注的样子，你笑起来真的好好看，可以认识一下吗？', author: '匿名', isAnonymous: true, likes: 128, comments: 32, createdAt: Date.now() - 3600000 },
          { id: 2, content: '计算机学院的学长，上次帮我修电脑的那个，你说"下次有问题再找我"，我想...我可能又有问题了 :)', author: '匿名', isAnonymous: true, likes: 256, comments: 48, createdAt: Date.now() - 7200000 },
          { id: 3, content: '致篮球场上穿12号球衣的男生：你的后仰跳投真的很帅！', author: '匿名', isAnonymous: true, likes: 88, comments: 12, createdAt: Date.now() - 86400000 },
          { id: 4, content: '食堂三楼卖奶茶的小姐姐，你的笑容比奶茶还甜！', author: '匿名', isAnonymous: true, likes: 156, comments: 25, createdAt: Date.now() - 86400000 * 2 }
        ]
      }
      this.setData({ confessions: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/confession/detail/detail?id=' + id })
  },

  async onLike(e) {
    const id = e.currentTarget.dataset.id
    const idx = e.currentTarget.dataset.idx
    try {
      await api.confession.like(id)
      const list = this.data.confessions.slice()
      list[idx].likes = (list[idx].likes || 0) + 1
      this.setData({ confessions: list })
    } catch (e) { util.showToast('点赞成功') }
  },

  onPublish() {
    wx.navigateTo({ url: '/pages/confession/publish/publish' })
  }
})
