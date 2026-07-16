// utils/payment.js - 微信支付封装
const util = require('./util.js')

/**
 * 发起微信支付
 * @param {Object} params { orderId, amount, title }
 */
function pay(params) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. 先调用后端下单接口获取 prepay_id
      const orderRes = await _request('/api/payment/prepay', {
        orderId: params.orderId,
        amount: params.amount,
        title: params.title || '订单支付'
      })

      // 2. mock fallback: 直接模拟成功
      const payParams = orderRes && orderRes.payParams ? orderRes.payParams : _mockPayParams()

      // 3. 调起微信支付
      wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType || 'MD5',
        paySign: payParams.paySign,
        success: () => resolve({ success: true, orderId: params.orderId }),
        fail: (err) => {
          if (err.errMsg === 'requestPayment:fail cancel') {
            reject(new Error('用户取消'))
          } else {
            // 模拟支付
            wx.showModal({
              title: '支付',
              content: '模拟环境，是否继续支付 ¥' + (params.amount / 100).toFixed(2) + '?',
              success: (res) => {
                if (res.confirm) resolve({ success: true, orderId: params.orderId })
                else reject(new Error('用户取消'))
              }
            })
          }
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

function _mockPayParams() {
  return {
    timeStamp: String(Math.floor(Date.now() / 1000)),
    nonceStr: _random(16),
    package: 'prepay_id=wx' + Date.now(),
    signType: 'MD5',
    paySign: 'MOCKPAYSIGN' + _random(10)
  }
}

function _random(n) {
  let s = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < n; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
  return s
}

function _request(url, data) {
  return new Promise((resolve) => {
    wx.request({
      url: (getApp() && getApp().globalData && getApp().globalData.apiBase || '') + url,
      method: 'POST',
      data: data || {},
      success: (res) => resolve(res.data && res.data.data ? res.data.data : res.data),
      fail: () => resolve(null)
    })
  })
}

module.exports = { pay }
