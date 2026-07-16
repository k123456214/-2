const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    post: null,
    commentInput: '',
    liked: false,
    favorited: false,
    voted: false,
    votedOption: null
  },

  onLoad(options) {
    this.postId = options.id
    this.loadPost()
  },

  async loadPost() {
    util.showLoading()
    try {
      let p = null
      try { p = await api.forum.detail(this.postId) } catch (e) {}
      if (!p) {
        p = {
          id: this.postId,
          author: '同学A',
          board: '校园生活',
          title: '图书馆新增自习区域开放啦',
          content: '今天去三楼发现新增了一大片安静的自习区，光线好，桌椅新，非常适合备考。同学们有需要的可以去看看。\n\n开放时间和主楼同步，早上8点到晚上10点。',
          likes: 120,
          comments: 35,
          views: 1200,
          isTop: true,
          isHot: true,
          createdAt: Date.now() - 3600000,
          vote: {
            title: '你最喜欢哪个自习区？',
            options: [
              { id: 1, text: '图书馆三楼', count: 88 },
              { id: 2, text: '教学楼A区', count: 60 },
              { id: 3, text: '创新大楼', count: 30 }
            ]
          },
          replies: [
            { id: 1, author: '用户B', content: '太好了，正愁找不到自习的地方', likes: 8, createdAt: Date.now() - 2000000 },
            { id: 2, author: '用户C', content: '感谢分享，下午去看看', likes: 3, createdAt: Date.now() - 1000000 }
          ]
        }
      }
      this.setData({ post: p })
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
      await api.forum.like(this.postId)
      const post = { ...this.data.post, likes: (this.data.post.likes || 0) + (this.data.liked ? -1 : 1) }
      this.setData({ post, liked: !this.data.liked })
    } catch (e) {}
  },

  async onFavorite() {
    try {
      await api.forum.favorite(this.postId)
      this.setData({ favorited: !this.data.favorited })
      util.showToast(this.data.favorited ? '已收藏' : '取消收藏')
    } catch (e) { util.showToast('操作失败') }
  },

  onShare() {
    util.showToast('分享链接已复制')
  },

  async onVote(e) {
    const optId = e.currentTarget.dataset.id
    const idx = e.currentTarget.dataset.idx
    try {
      await api.forum.vote(this.postId, optId)
      const post = { ...this.data.post }
      if (post.vote && post.vote.options[idx]) {
        post.vote.options[idx].count += 1
        this.setData({ post, voted: true, votedOption: optId })
        util.showToast('投票成功', 'success')
      }
    } catch (e) { util.showToast('投票失败') }
  },

  async onSubmitComment() {
    if (!this.data.commentInput.trim()) return util.showToast('请输入评论内容')
    util.showLoading()
    try {
      await api.forum.reply(this.postId, { content: this.data.commentInput })
      const post = { ...this.data.post, replies: [...(this.data.post.replies || []), {
        id: Date.now(),
        author: '我',
        content: this.data.commentInput,
        likes: 0,
        createdAt: Date.now()
      }] }
      post.comments = (post.comments || 0) + 1
      this.setData({ post, commentInput: '' })
      util.hideLoading()
      util.showToast('评论成功', 'success')
    } catch (e) {
      util.hideLoading()
      util.showToast('评论失败')
    }
  }
})
