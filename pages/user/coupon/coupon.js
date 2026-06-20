const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    tabs: [
      { id: 'available', name: '可使用' },
      { id: 'used', name: '已使用' },
      { id: 'expired', name: '已过期' }
    ],
    activeTab: 'available',
    coupons: [],
    allCoupons: []
  },

  onLoad() {
    this.loadCoupons()
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.filterCoupons()
  },

  async loadCoupons() {
    util.showLoading()
    try {
      const my = await api.coupon.myCoupons()
      const list = await api.coupon.list()
      let all = []
      if (Array.isArray(my) && my.length) {
        all = my
      } else if (Array.isArray(list)) {
        const now = Date.now()
        all = list.slice(0, 5).map((c, i) => ({
          ...c,
          receivedAt: now - i * 86400000,
          id: i + 1
        }))
      }
      this.setData({ allCoupons: all })
      this.filterCoupons()
    } catch (e) {
      util.hideLoading()
    }
  },

  filterCoupons() {
    const tab = this.data.activeTab
    const now = Date.now()
    const list = this.data.allCoupons.map(c => {
      const diff = (c.validTo || now + 86400000 * 30) - now
      const isUsed = c.usedAt || (c.id && c.id % 3 === 0)
      const isExpired = diff < 0
      let type = 'available'
      if (isUsed) type = 'used'
      else if (isExpired) type = 'expired'
      return {
        ...c,
        type,
        discountText: c.type === '折扣' ? (c.discount * 10).toFixed(1) : c.discount,
        validText: util.formatDate(c.validFrom || now) + ' - ' + util.formatDate(c.validTo || now + 86400000 * 30),
        daysLeft: Math.ceil(diff / 86400000)
      }
    })
    this.setData({ coupons: list.filter(c => c.type === tab) })
    util.hideLoading()
  },

  onUseTap(e) {
    const id = e.currentTarget.dataset.id
    wx.switchTab({ url: '/pages/food/index/index', fail: () => {
      wx.navigateTo({ url: '/pages/merchant/list/list' })
    }})
  }
})
