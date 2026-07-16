const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: '全部', name: '全部' },
      { id: '运动', name: '运动' },
      { id: '科技', name: '科技' },
      { id: '艺术', name: '艺术' },
      { id: '音乐', name: '音乐' },
      { id: '其他', name: '其他' }
    ],
    activeTab: '全部',
    communities: []
  },

  onShow() {
    this.loadData()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.loadData()
  },

  async loadData() {
    util.showLoading()
    try {
      const res = await api.community.list({ page: 1, pageSize: 50 })
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, name: '校园篮球社', category: '运动', members: 328, posts: 1280, description: '篮球爱好者聚集地，每周五晚球场见', logo: '', cover: '', joined: false },
          { id: 2, name: '编程与算法', category: '科技', members: 512, posts: 2100, description: '代码改变世界，每周算法分享会', logo: '', cover: '', joined: true },
          { id: 3, name: '摄影爱好社', category: '艺术', members: 156, posts: 680, description: '用镜头记录美好，定期外拍活动', logo: '', cover: '', joined: false },
          { id: 4, name: '校园吉他社', category: '音乐', members: 208, posts: 450, description: '音乐无国界，一起拨动琴弦', logo: '', cover: '', joined: false },
          { id: 5, name: '桌游社', category: '其他', members: 88, posts: 220, description: '狼人杀、三国杀、桌游之夜', logo: '', cover: '', joined: false }
        ]
        if (this.data.activeTab !== '全部') {
          list = list.filter(c => c.category === this.data.activeTab)
        }
      }
      this.setData({ communities: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/community/detail/detail?id=' + id })
  },

  async onJoin(e) {
    const id = e.currentTarget.dataset.id
    const idx = e.currentTarget.dataset.idx
    util.showLoading()
    try {
      await api.community.join(id)
      const list = this.data.communities.slice()
      if (list[idx]) {
        list[idx].joined = true
        list[idx].members = (list[idx].members || 0) + 1
        this.setData({ communities: list })
      }
      util.hideLoading()
      util.showToast('加入成功', 'success')
    } catch (e) {
      util.hideLoading()
      util.showToast('加入失败')
    }
  },

  onCreate() {
    wx.navigateTo({ url: '/pages/community/create/create' })
  }
})
