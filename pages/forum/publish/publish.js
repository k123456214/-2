const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    boards: ['校园生活', '学习交流', '失物招领', '求职招聘'],
    form: {
      board: '校园生活',
      title: '',
      content: '',
      anonymous: false
    },
    hasVote: false,
    voteOptions: ['', ''],
    submitting: false
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const form = { ...this.data.form }
    form[key] = e.detail.value
    this.setData({ form })
  },

  onBoardTap(e) {
    const idx = e.currentTarget.dataset.idx
    const form = { ...this.data.form, board: this.data.boards[idx] }
    this.setData({ form })
  },

  toggleAnonymous() {
    this.setData({ 'form.anonymous': !this.data.form.anonymous })
  },

  toggleHasVote() {
    this.setData({ hasVote: !this.data.hasVote })
  },

  onVoteOptionInput(e) {
    const idx = e.currentTarget.dataset.idx
    const opts = this.data.voteOptions.slice()
    opts[idx] = e.detail.value
    this.setData({ voteOptions: opts })
  },

  addVoteOption() {
    const opts = this.data.voteOptions.slice()
    if (opts.length >= 6) return util.showToast('最多6个选项')
    opts.push('')
    this.setData({ voteOptions: opts })
  },

  removeVoteOption(e) {
    const idx = e.currentTarget.dataset.idx
    const opts = this.data.voteOptions.slice()
    if (opts.length <= 2) return util.showToast('至少2个选项')
    opts.splice(idx, 1)
    this.setData({ voteOptions: opts })
  },

  async onSubmit() {
    const f = this.data.form
    if (!f.title) return util.showToast('请输入标题')
    if (!f.content) return util.showToast('请输入正文')

    this.setData({ submitting: true })
    util.showLoading()
    try {
      const payload = { ...f, board: f.board }
      if (this.data.hasVote) {
        const opts = this.data.voteOptions.map(o => o.trim()).filter(Boolean)
        if (opts.length >= 2) payload.vote = opts
      }
      await api.forum.create(payload)
      util.hideLoading()
      wx.showModal({
        title: '发布成功',
        content: '您的帖子已发布',
        showCancel: false,
        success: () => wx.navigateBack()
      })
    } catch (e) {
      util.hideLoading()
      util.showToast('发布失败')
    } finally {
      this.setData({ submitting: false })
    }
  }
})
