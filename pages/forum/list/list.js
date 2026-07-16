const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    boards: [
      { id: '', name: '全部' },
      { id: '校园生活', name: '校园生活' },
      { id: '学习交流', name: '学习交流' },
      { id: '失物招领', name: '失物招领' },
      { id: '求职招聘', name: '求职招聘' }
    ],
    activeBoard: '',
    keyword: '',
    posts: []
  },

  onShow() {
    this.loadPosts()
  },

  onBoardTap(e) {
    this.setData({ activeBoard: e.currentTarget.dataset.id })
    this.loadPosts()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.loadPosts()
  },

  async loadPosts() {
    util.showLoading()
    try {
      let res = null
      try {
        res = await api.forum.list({ page: 1, pageSize: 30, boardId: this.data.activeBoard, keyword: this.data.keyword })
      } catch (e) {}
      let list = res && res.list ? res.list : []
      if (list.length === 0) {
        list = [
          { id: 1, board: '校园生活', author: '同学A', title: '图书馆新增自习区域开放啦', content: '今天发现3楼新开放了一片自习区，安静明亮，强烈推荐给需要备考的同学。', likes: 120, comments: 35, views: 1200, isTop: true, isHot: true, isEssence: true, createdAt: Date.now() - 3600000 },
          { id: 2, board: '学习交流', author: '学霸君', title: '分享一份考研数学复习笔记', content: '整理了近3年的真题分析，包含解题思路和技巧，需要的同学自取。', likes: 280, comments: 60, views: 3200, isTop: false, isHot: true, isEssence: true, hasVote: true, createdAt: Date.now() - 7200000 },
          { id: 3, board: '失物招领', author: '好心人', title: '在食堂捡到一张校园卡', content: '姓名: 王同学，有认识的请联系我。', likes: 5, comments: 2, views: 80, isTop: false, isHot: false, isEssence: false, createdAt: Date.now() - 86400000 },
          { id: 4, board: '求职招聘', author: 'HR小姐姐', title: '某互联网公司实习生招聘', content: '前端/后端/算法岗位，有兴趣的同学私信。', likes: 66, comments: 22, views: 880, isTop: false, isHot: false, isEssence: false, createdAt: Date.now() - 172800000 }
        ]
      }
      this.setData({ posts: list })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/forum/detail/detail?id=' + id })
  },

  onPublish() {
    wx.navigateTo({ url: '/pages/forum/publish/publish' })
  }
})
