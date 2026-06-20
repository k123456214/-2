const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: 'posts', name: '动态' },
      { id: 'activities', name: '活动' },
      { id: 'members', name: '成员' }
    ],
    activeTab: 'posts',
    community: null,
    posts: [],
    activities: []
  },

  onLoad(options) {
    this.communityId = options.id
    this.loadData()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
  },

  async loadData() {
    util.showLoading()
    try {
      let c = null, posts = [], acts = []
      try { c = await api.community.detail(this.communityId) } catch (e) {}
      try {
        const p = await api.community.posts(this.communityId, { page: 1, pageSize: 20 })
        posts = p && p.list ? p.list : []
      } catch (e) {}
      try {
        const a = await api.community.activities({ page: 1, pageSize: 20 })
        acts = a && a.list ? a.list : []
      } catch (e) {}

      if (!c) {
        c = {
          id: this.communityId,
          name: '校园篮球社',
          category: '运动',
          members: 328,
          posts: 1280,
          description: '篮球爱好者聚集地，每周五晚球场见',
          joined: true
        }
      }
      if (posts.length === 0) {
        posts = [
          { id: 1, author: '小明', avatar: '', content: '今晚8点篮球场5v5，有兴趣的同学来', likes: 25, comments: 8, createdAt: Date.now() - 1800000 },
          { id: 2, author: '球王', avatar: '', content: '分享一个超实用的投篮训练视频', likes: 88, comments: 22, createdAt: Date.now() - 7200000 }
        ]
      }
      if (acts.length === 0) {
        acts = [
          { id: 1, title: '新生杯篮球赛', location: '校园体育馆', startTime: Date.now() + 86400000, signupCount: 42, capacity: 100, fee: 0 },
          { id: 2, title: '每周训练', location: '室外篮球场', startTime: Date.now() + 86400000 * 2, signupCount: 18, capacity: 50, fee: 0 }
        ]
      }
      this.setData({ community: c, posts, activities: acts })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onActivitySignup(e) {
    util.showToast('报名成功', 'success')
  },

  onPublish() {
    util.showToast('发布动态 (模拟)')
  },

  onJoin() {
    const c = { ...this.data.community, joined: true, members: (this.data.community.members || 0) + 1 }
    this.setData({ community: c })
    util.showToast('加入成功', 'success')
  }
})
