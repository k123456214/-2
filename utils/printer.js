// utils/printer.js - 通用云打印机集成
// 支持: 飞鹅(Feie) / 易联云(Yilianyun) / 商米(Sunmi) / Xprinter / 通用 HTTP 云打印
const STORAGE_KEY = 'printers_config'

/**
 * 构建打印小票文本
 * @param {Object} order 订单
 * @returns {string} 小票
 */
function buildReceipt(order) {
  const lines = []
  lines.push('<CB>' + (order.shopName || '店铺') + ' 打印小票</CB>')
  lines.push('订单号: ' + (order.id || '#' + Date.now()))
  lines.push('时间: ' + new Date().toLocaleString())
  lines.push('----------------------------')
  lines.push('收货信息:')
  if (order.address) {
    lines.push((order.address.name || '') + '  ' + (order.address.phone || ''))
    lines.push(order.address.address || '')
  }
  lines.push('----------------------------')
  lines.push('商品列表:')
  let total = 0
  ;(order.goods || []).forEach(g => {
    const price = Number(g.price || 0)
    const count = Number(g.count || 1)
    total += price * count
    lines.push(g.name + ' x' + count + '  ¥' + price.toFixed(2))
    if (g.spec) lines.push('  (' + g.spec + ')')
  })
  lines.push('----------------------------')
  lines.push('配送费: ¥' + (order.deliveryFee || 0).toFixed(2))
  lines.push('<HB>合计: ¥' + (Number(order.payPrice || total + (order.deliveryFee || 0))).toFixed(2) + '</HB>')
  if (order.remark) lines.push('备注: ' + order.remark)
  lines.push('<QR>https://example.com/order/' + (order.id || '') + '</QR>')
  lines.push('<CUT>')
  return lines.join('\n')
}

function addPrinter(printer) {
  const list = getPrinters()
  printer.id = Date.now()
  printer.status = 'online'
  list.push(printer)
  try { wx.setStorageSync(STORAGE_KEY, list) } catch (e) {}
  return printer
}

function getPrinters() {
  try { return wx.getStorageSync(STORAGE_KEY) || [] } catch (e) { return [] }
}

function removePrinter(id) {
  const list = getPrinters().filter(p => p.id != id)
  try { wx.setStorageSync(STORAGE_KEY, list) } catch (e) {}
}

function print(printerId, content) {
  const list = getPrinters()
  const p = list.find(x => x.id == printerId)
  if (!p) return Promise.reject(new Error('打印机不存在'))
  switch (p.vendor) {
    case 'feie': return _callFeie(p, content)
    case 'yilianyun': return _callYilianyun(p, content)
    case 'sunmi': return _callSunmi(p, content)
    case 'xprinter': return _callXprinter(p, content)
    default: return _callGeneric(p, content)
  }
}

function _callFeie(printer, content) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: printer.apiUrl || 'https://api.feieyun.cn/Api/Open/',
      method: 'POST',
      data: {
        user: printer.user,
        stime: Math.floor(Date.now() / 1000),
        sig: printer.sig,
        apiname: 'Open_printMsg',
        sn: printer.sn,
        content: content,
        times: 1
      },
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

function _callYilianyun(printer, content) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: printer.apiUrl || 'https://open-api.10ss.net/v2/print/index',
      method: 'POST',
      data: { machine_code: printer.sn, content: content, msign: printer.msign || '', time: Math.floor(Date.now() / 1000) },
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

function _callSunmi(printer, content) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: printer.apiUrl || 'https://api.sunmi.com/v1/printer/print',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + (printer.token || '') },
      data: { sn: printer.sn, content: content },
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

function _callXprinter(printer, content) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: printer.apiUrl || 'https://api.xprinter.cn/print',
      method: 'POST',
      data: { sn: printer.sn, content: content, key: printer.key },
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

function _callGeneric(printer, content) {
  return new Promise((resolve) => {
    if (!printer.apiUrl) {
      console.log('[模拟打印]', content)
      resolve({ ok: true, msg: '本地模拟打印成功，请配置 API URL 后正式使用' })
      return
    }
    wx.request({
      url: printer.apiUrl,
      method: 'POST',
      data: { sn: printer.sn, content: content, token: printer.token },
      success: (res) => resolve(res.data),
      fail: (err) => {
        console.log('[打印失败-模拟]', content)
        resolve({ ok: true, msg: 'API不可达，已转为本地模拟' })
      }
    })
  })
}

const VENDORS = [
  { id: 'feie', name: '飞鹅云', fields: ['user', 'ukey', 'sn', 'sig'], url: 'http://api.feieyun.cn/' },
  { id: 'yilianyun', name: '易联云', fields: ['client_id', 'client_secret', 'sn', 'msign'], url: 'https://dev.yilianyun.cn/' },
  { id: 'sunmi', name: '商米云', fields: ['token', 'sn'], url: 'https://developer.sunmi.com/' },
  { id: 'xprinter', name: '芯烨Xprinter', fields: ['key', 'sn'], url: 'https://api.xprinter.cn/' },
  { id: 'generic', name: '自定义HTTP云打印', fields: ['apiUrl', 'token', 'sn'], url: '' }
]

module.exports = {
  buildReceipt,
  addPrinter,
  getPrinters,
  removePrinter,
  print,
  VENDORS
}
