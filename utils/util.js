// utils/util.js - 通用工具
function formatTime(date) {
  if (typeof date === 'number') date = new Date(date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`
}

function formatDate(date) {
  if (typeof date === 'number') date = new Date(date)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pad(n) { return n < 10 ? '0' + n : n }

function formatPrice(price) {
  return '¥' + parseFloat(price).toFixed(2)
}

function formatCount(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 3600 * 1000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400 * 1000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 86400 * 1000 * 7) return Math.floor(diff / 86400000) + '天前'
  return formatDate(ts)
}

function showToast(title, icon = 'none') {
  wx.showToast({ title, icon, duration: 2000 })
}

function showLoading(title = '加载中...') {
  wx.showLoading({ title, mask: true })
}

function hideLoading() {
  wx.hideLoading()
}

function confirm(title, content) {
  return new Promise((resolve) => {
    wx.showModal({
      title, content,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => resolve(res.confirm)
    })
  })
}

function navigateTo(url) {
  wx.navigateTo({ url })
}

function switchTab(url) {
  wx.switchTab({ url })
}

function setTabBarBadge(index, text) {
  if (text) {
    wx.setTabBarBadge({ index, text: String(text) }).catch(() => {})
  } else {
    wx.removeTabBarBadge({ index }).catch(() => {})
  }
}

// 计算购物车总价
function calcCartTotal(cart) {
  let total = 0
  Object.values(cart).forEach(shop => {
    shop.goods.forEach(g => { total += g.price * g.count })
  })
  return total
}

// 计算购物车数量
function calcCartCount(cart) {
  let count = 0
  Object.values(cart).forEach(shop => {
    shop.goods.forEach(g => { count += g.count })
  })
  return count
}

// 安全解析 JSON
function safeParse(str, defaultValue) {
  try { return JSON.parse(str) } catch(e) { return defaultValue }
}

// 生成随机字符串
function randomStr(len = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
  return s
}

// 防抖
function debounce(fn, wait = 300) {
  let timer
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
}

// 节流
function throttle(fn, wait = 300) {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      fn.apply(this, args)
    }
  }
}

// 深拷贝
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

module.exports = {
  formatTime, formatDate, formatPrice, formatCount, timeAgo,
  showToast, showLoading, hideLoading, confirm, navigateTo, switchTab,
  calcCartTotal, calcCartCount, safeParse, randomStr,
  debounce, throttle, deepClone
}
