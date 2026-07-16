// utils/request.js - 网络请求封装
const app = () => getApp()

class Request {
  constructor() {
    this.baseURL = ''
    this.timeout = 15000
  }

  request(options) {
    const appInstance = app()
    return new Promise((resolve, reject) => {
      // 模拟模式：直接使用mock数据
      if (!options.url || options.mock !== false) {
        // 当未配置真实后端时使用 mock
        this._mockHandle(options).then(resolve).catch(reject)
        return
      }

      wx.request({
        url: (options.baseURL || this.baseURL) + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: Object.assign(
          {
            'Content-Type': 'application/json',
            Authorization: appInstance && appInstance.globalData.token ?
              'Bearer ' + appInstance.globalData.token : ''
          },
          options.header || {}
        ),
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.code === 0 || res.data.code === 200) {
              resolve(res.data.data || res.data)
            } else {
              wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
              reject(res.data)
            }
          } else if (res.statusCode === 401) {
            appInstance && appInstance.logout()
            wx.navigateTo({ url: '/pages/user/login/login' })
            reject(res)
          } else {
            reject(res)
          }
        },
        fail: reject
      })
    })
  }

  // Mock 处理器
  _mockHandle(options) {
    return new Promise((resolve) => {
      setTimeout(() => {
      const mock = require('./mock.js')
      const result = mock.handle(options.url, options.method, options.data)
      resolve(result)
    }, 300)
  }

  get(url, data, options = {}) {
    return this.request({ url, method: 'GET', data, ...options })
  }

  post(url, data, options = {}) {
    return this.request({ url, method: 'POST', data, ...options })
  }

  put(url, data, options = {}) {
    return this.request({ url, method: 'PUT', data, ...options })
  }

  delete(url, data, options = {}) {
    return this.request({ url, method: 'DELETE', data, ...options })
  }

  upload(filePath, name = 'file') {
    return new Promise((resolve, reject) => {
      // 模拟上传
      setTimeout(() => {
        resolve({ url: 'https://img.cdn.example.com/upload/' + Date.now() + '.jpg' })
      }, 500)
    })
  }
}

module.exports = new Request()
