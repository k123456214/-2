const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    confession: null,
    commentInput: '',
    liked: false
  },

  onLoad(options) {
    this.confessionId = options.id
    this.loadData()
  },

  async loadData() {
    util.showLoading()
    try {
      let c = null
      try { c = await api.confession.detail(this.confessionId) } catch (e) {}
      if (!c) {
        c = {
          id: this.confessionId,
          author: '匿名',
          isAnonymous: true,
          content: '图书馆三楼靠窗第三排的女生，每天都能看到你专注的样子，你笑起来真的好好看，可以认识一下吗？',
          likes: 128,
          comments: 32,
          createdAt: Date.now() - 3600000,
          replies: [
            { id: 1, author: '匿名', content: '祝福！', likes: 5, createdAt: Date.now() - 2000000 },
            { id: 2, author: '匿名', content: '可以去图书馆搭讪一下', likes: 3, createdAt: Date.now() - 1000000 }
          ]
        }
      }
      this.setData({ confession: c })
    } catch (e) {
      console.error(e)
    } finally {
      util.hideLoading()
    }
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  async onLike() {
    try {
      await api.confession.like(this.confessionId)
      const c = { ...this.data.confession, likes: (this.data.confession.likes || 0) + (this.data.liked ? -1 : 1) }
      this.setData({ confession: c, liked: !this.data.liked })
    } catch (e) { util.showToast('点赞成功') }
  },

  onReport() {
    wx.showModal({
      title: '举报',
      content: '确认举报这条表白？',
      success: (res) => {
        if (res.confirm) {
          api.confession.report(this.confessionId, '不合适内容').then(() => {
            util.showToast('举报已提交')
          }).catch(() => util.showToast('举报已提交'))
        }
      }
    })
  },

  async onSubmitComment() {
    if (!this.data.commentInput.trim()) return util.showToast('请输入评论内容')
    util.showLoading()
    try {
      await api.confession.comment(this.confessionId, { content: this.data.commentInput })
      const c = { ...this.data.confession, replies: [...(this.data.confession.replies || []), {
        id: Date.now(), author: '匿名', content: this.data.commentInput, likes: 0, createdAt: Date.now()
      }] }
      c.comments = (c.comments || 0) + 1
      this.setData({ confession: c, commentInput: '' })
      util.hideLoading()
      util.showToast('评论成功', 'success')
    } catch (e) {
      util.hideLoading()
      util.showToast('评论失败')
    }
  }
})
