// config.example.js - 小程序配置示例
// 复制为 config.js 并修改为实际配置
module.exports = {
  // 后端 API 基础地址
  apiBase: 'https://api.your-campus.com',

  // 小程序 AppID
  appId: 'wx1234567890abcdef',

  // 上传图片地址
  uploadUrl: 'https://api.your-campus.com/upload',

  // 微信支付相关（后端实现）
  payment: {
    enable: true,
    // 实际支付逻辑在后端完成，这里只配置入口
    prepayUrl: '/api/payment/prepay'
  },

  // 高德/腾讯地图 key（可选）
  mapKey: '',

  // 消息推送配置
  templateIds: {
    orderPayed: 'tmpl_1',
    orderDelivering: 'tmpl_2',
    orderComment: 'tmpl_3'
  },

  // 商家入驻审核回调地址
  merchantApplyCallback: 'https://api.your-campus.com/merchant/apply/callback'
}
