// server/index.js - 后端 API 示例（Node.js + Express）
// 说明: 这是一个最小可运行的服务端示例，实现本小程序所需的所有后端接口
// 运行: npm install express cors body-parser ; node server/index.js
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

// ========== 内存数据库（生产环境请换成 MySQL/MongoDB） ==========
const DB = {
  users: [],
  merchants: [],
  goods: [],
  orders: [],
  communities: [],
  communityPosts: [],
  forumPosts: [],
  forumReplies: [],
  confessions: [],
  marketGoods: [],
  coupons: [],
  errands: [],
  activities: [],
  diyPages: []
}

function uid() { return Date.now() + Math.floor(Math.random() * 1000) }
function ok(data, res) { res.json({ code: 0, data })}
function fail(msg, res) { res.json({ code: 1, msg })}

// 中间件 - 简单鉴权
function auth(req, res, next) {
  const token = req.headers.authorization
  if (token && token.startsWith('Bearer ')) {
    req.userId = token.replace('Bearer ', '')
    next()
  } else {
    fail('未登录', res)
  }
}

// ========== 用户模块 ==========
app.post('/api/user/login', (req, res) => {
  const { code, role } = req.body
  const user = { id: uid(), nickname: '校园用户', avatar: '', role: role || 'user', level: 1, points: 100 }
  DB.users.push(user)
  ok({ token: 'token_' + user.id, info: user }, res)
})

app.get('/api/user/profile', auth, (req, res) => {
  ok({ id: req.userId, nickname: '校园用户', role: 'user', level: 1, points: 100, balance: 0, memberSince: Date.now() }, res)
})

app.put('/api/user/profile', auth, (req, res) => {
  ok({ success: true }, res)
})

// ========== 商户模块 ==========
app.post('/api/merchant/apply', auth, (req, res) => {
  const apply = { id: uid(), userId: req.userId, status: 0, ...req.body, createdAt: Date.now() }
  DB.merchants.push(apply)
  ok({ applyId: apply.id, status: 'pending' }, res)
})

app.get('/api/merchant/list', (req, res) => {
  let list = DB.merchants.filter(m => m.status === 1)
  if (req.query.category) list = list.filter(m => m.category === req.query.category)
  const page = parseInt(req.query.page) || 1
  const size = parseInt(req.query.pageSize) || 10
  ok({
    list: list.slice((page - 1) * size, page * size),
    total: list.length,
    page,
    hasMore: page * size < list.length
  }, res)
})

app.get('/api/merchant/detail/:id', (req, res) => {
  const m = DB.merchants.find(x => x.id == req.params.id)
  if (!m) return fail('商户不存在', res)
  const goods = DB.goods.filter(g => g.shopId == req.params.id && g.status === 1)
  ok({ ...m, goods }, res)
})

app.get('/api/merchant/my-shop', auth, (req, res) => {
  const shop = DB.merchants.find(m => m.ownerId == req.userId) || DB.merchants[0]
  ok(shop, res)
})

app.get('/api/merchant/stats', auth, (req, res) => {
  ok({
    todayOrders: 25,
    todaySales: 580,
    weekOrders: 180,
    weekSales: 4200,
    totalOrders: 1520,
    totalSales: 35000,
    dailyData: [
      { date: '周一', orders: 32, sales: 720 },
      { date: '周二', orders: 28, sales: 640 },
      { date: '周三', orders: 45, sales: 980 }
    ],
    topGoods: []
  }, res)
})

// ========== 商品 ==========
app.get('/api/goods/list', (req, res) => {
  let list = DB.goods.filter(g => g.status === 1)
  if (req.query.shopId) list = list.filter(g => g.shopId == req.query.shopId)
  const page = parseInt(req.query.page) || 1
  const size = parseInt(req.query.pageSize) || 10
  ok({ list: list.slice((page - 1) * size, page * size), total: list.length, page, hasMore: true }, res)
})

app.post('/api/goods', auth, (req, res) => {
  const g = { id: uid(), status: 1, sales: 0, ...req.body }
  DB.goods.push(g)
  ok(g, res)
})

app.put('/api/goods/:id', auth, (req, res) => {
  const g = DB.goods.find(x => x.id == req.params.id)
  if (!g) return fail('商品不存在', res)
  Object.assign(g, req.body)
  ok(g, res)
})

app.delete('/api/goods/:id', auth, (req, res) => {
  DB.goods = DB.goods.filter(g => g.id != req.params.id)
  ok({ success: true }, res)
})

app.get('/api/goods/categories', (req, res) => {
  ok([
    { id: 1, name: '餐饮', children: [{ id: 101, name: '主食' }, { id: 102, name: '小吃' }] },
    { id: 2, name: '零售', children: [{ id: 201, name: '日用品' }, { id: 202, name: '零食' }] },
    { id: 3, name: '服务', children: [{ id: 301, name: '理发' }] }
  ], res)
})

// ========== 订单 ==========
app.post('/api/order', auth, (req, res) => {
  const order = { id: 'OD' + Date.now(), userId: req.userId, status: 0, ...req.body, createdAt: Date.now() }
  DB.orders.push(order)
  ok(order, res)
})

app.get('/api/order/list', auth, (req, res) => {
  let list = DB.orders.filter(o => o.userId == req.userId).reverse()
  if (req.query.status) list = list.filter(o => o.status == req.query.status)
  ok({ list, total: list.length, page: 1, hasMore: false }, res)
})

app.get('/api/order/detail/:id', (req, res) => {
  const o = DB.orders.find(x => x.id == req.params.id)
  if (!o) return fail('订单不存在', res)
  ok(o, res)
})

app.post('/api/order/:id/pay', auth, (req, res) => {
  const o = DB.orders.find(x => x.id == req.params.id)
  if (o) { o.status = 1; o.payTime = Date.now() }
  ok({ success: true }, res)
})

app.post('/api/order/:id/cancel', auth, (req, res) => {
  const o = DB.orders.find(x => x.id == req.params.id)
  if (o) o.status = 5
  ok({ success: true }, res)
})

app.post('/api/order/:id/confirm', auth, (req, res) => {
  const o = DB.orders.find(x => x.id == req.params.id)
  if (o) { o.status = 4; o.completedAt = Date.now() }
  ok({ success: true }, res)
})

app.post('/api/order/:id/refund', auth, (req, res) => {
  ok({ success: true }, res)
})

// 商户端订单
app.get('/api/merchant/order/list', auth, (req, res) => {
  ok({ list: DB.orders.slice().reverse(), total: DB.orders.length, hasMore: false }, res)
})

// 打印小票
app.post('/api/order/:id/print', auth, async (req, res) => {
  const order = DB.orders.find(o => o.id == req.params.id)
  const { printerId } = req.body
  // 此处实际调用云打印 SDK (feie / yilianyun / sunmi / xprinter)
  ok({ success: true, printId: 'PRT' + Date.now(), orderId: order && order.id }, res)
})

// ========== 跑腿 ==========
app.get('/api/errand/list', (req, res) => {
  ok({ list: DB.errands.slice().reverse(), total: DB.errands.length, hasMore: false }, res)
})

app.post('/api/errand', auth, (req, res) => {
  const e = { id: uid(), status: 0, publisherId: req.userId, ...req.body, createdAt: Date.now() }
  DB.errands.push(e)
  ok(e, res)
})

app.post('/api/errand/:id/accept', auth, (req, res) => {
  const e = DB.errands.find(x => x.id == req.params.id)
  if (e) { e.status = 1; e.runnerId = req.userId }
  ok({ success: true }, res)
})

app.post('/api/errand/:id/complete', auth, (req, res) => {
  const e = DB.errands.find(x => x.id == req.params.id)
  if (e) e.status = 2
  ok({ success: true }, res)
})

// ========== 社区 ==========
app.get('/api/community/list', (req, res) => {
  ok({ list: DB.communities, total: DB.communities.length, hasMore: false }, res)
})

app.get('/api/community/detail/:id', (req, res) => {
  ok(DB.communities.find(c => c.id == req.params.id), res)
})

app.post('/api/community', auth, (req, res) => {
  const c = { id: uid(), members: 1, posts: 0, status: 1, ...req.body }
  DB.communities.push(c)
  ok(c, res)
})

app.post('/api/community/:id/join', auth, (req, res) => {
  ok({ success: true }, res)
})

app.get('/api/community/:id/posts', (req, res) => {
  const list = DB.communityPosts.filter(p => p.communityId == req.params.id)
  ok({ list, total: list.length, hasMore: false }, res)
})

app.post('/api/community/:id/posts', auth, (req, res) => {
  const p = { id: uid(), communityId: req.params.id, author: '用户', userId: req.userId, likes: 0, comments: 0, views: 0, ...req.body, createdAt: Date.now() }
  DB.communityPosts.push(p)
  ok(p, res)
})

app.get('/api/community/activities', (req, res) => {
  ok({ list: DB.activities, total: DB.activities.length, hasMore: false }, res)
})

app.post('/api/community/activity/:id/signup', auth, (req, res) => {
  ok({ success: true }, res)
})

app.post('/api/community/activity/:id/checkin', auth, (req, res) => {
  ok({ success: true }, res)
})

// ========== 论坛 ==========
app.get('/api/forum/boards', (req, res) => {
  ok([
    { id: 1, name: '校园生活', posts: 5200 },
    { id: 2, name: '学习交流', posts: 3100 },
    { id: 3, name: '失物招领', posts: 890 },
    { id: 4, name: '求职招聘', posts: 420 }
  ], res)
})

app.get('/api/forum/list', (req, res) => {
  let list = DB.forumPosts.slice().sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || b.createdAt - a.createdAt)
  if (req.query.boardId) list = list.filter(p => p.boardId == req.query.boardId)
  ok({ list, total: list.length, hasMore: false }, res)
})

app.get('/api/forum/detail/:id', (req, res) => {
  const post = DB.forumPosts.find(p => p.id == req.params.id)
  if (!post) return fail('帖子不存在', res)
  post.replies = DB.forumReplies.filter(r => r.postId == req.params.id)
  ok(post, res)
})

app.post('/api/forum', auth, (req, res) => {
  const p = { id: uid(), userId: req.userId, author: '用户', likes: 0, comments: 0, views: 0, ...req.body, createdAt: Date.now() }
  DB.forumPosts.push(p)
  ok(p, res)
})

app.post('/api/forum/:id/reply', auth, (req, res) => {
  const r = { id: uid(), postId: req.params.id, author: '用户', content: req.body.content, likes: 0, createdAt: Date.now() }
  DB.forumReplies.push(r)
  ok(r, res)
})

app.post('/api/forum/:id/like', auth, (req, res) => { ok({ success: true }, res) })
app.post('/api/forum/:id/favorite', auth, (req, res) => { ok({ success: true }, res) })
app.post('/api/forum/:id/vote', auth, (req, res) => { ok({ success: true }, res) })

// ========== 表白墙 ==========
app.get('/api/confession/list', (req, res) => {
  ok({ list: DB.confessions.slice().sort((a, b) => b.createdAt - a.createdAt), total: DB.confessions.length, hasMore: false }, res)
})
app.post('/api/confession', auth, (req, res) => {
  const c = { id: uid(), likes: 0, comments: 0, author: '匿名', ...req.body, createdAt: Date.now() }
  DB.confessions.push(c)
  ok(c, res)
})
app.post('/api/confession/:id/like', auth, (req, res) => ok({ success: true }, res))
app.post('/api/confession/:id/comment', auth, (req, res) => ok({ success: true }, res))

// ========== 二手市场 ==========
app.get('/api/market/list', (req, res) => {
  let list = DB.marketGoods.filter(g => g.status === 1).sort((a, b) => b.createdAt - a.createdAt)
  if (req.query.category) list = list.filter(g => g.category === req.query.category)
  ok({ list, total: list.length, hasMore: false }, res)
})
app.post('/api/market', auth, (req, res) => {
  const g = { id: uid(), views: 0, likes: 0, status: 1, sellerId: req.userId, seller: '用户', ...req.body, createdAt: Date.now() }
  DB.marketGoods.push(g)
  ok(g, res)
})
app.get('/api/market/detail/:id', (req, res) => {
  ok(DB.marketGoods.find(g => g.id == req.params.id), res)
})
app.get('/api/market/my-goods', auth, (req, res) => {
  ok({ list: DB.marketGoods.filter(g => g.sellerId == req.userId), total: 0, hasMore: false }, res)
})
app.put('/api/market/:id/offline', auth, (req, res) => ok({ success: true }, res))
app.post('/api/market/:id/favorite', auth, (req, res) => ok({ success: true }, res))
app.get('/api/market/categories', (req, res) => {
  ok(['数码', '书籍', '服饰', '生活用品', '体育用品', '其他'], res)
})

// ========== 优惠券 ==========
app.get('/api/coupon/list', (req, res) => {
  if (DB.coupons.length === 0) {
    DB.coupons.push(
      { id: 1, name: '新用户满20减5', type: '满减', minOrder: 20, discount: 5 },
      { id: 2, name: '周末特惠8折券', type: '折扣', minOrder: 30, discount: 0.8 },
      { id: 3, name: '全场通用券', type: '满减', minOrder: 50, discount: 10 }
    )
  }
  ok(DB.coupons, res)
})
app.post('/api/coupon/:id/receive', auth, (req, res) => ok({ success: true }, res))

// ========== DIY页面 ==========
app.get('/api/diy/list', (req, res) => ok(DB.diyPages, res))
app.get('/api/diy/detail/:id', (req, res) => ok(DB.diyPages.find(p => p.id == req.params.id), res))

// ========== 微信支付 ==========
app.post('/api/payment/prepay', auth, (req, res) => {
  // 真实环境：调用微信统一下单 API
  ok({
    payParams: {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: 'abcdefg1234567',
      package: 'prepay_id=wx' + Date.now(),
      signType: 'MD5',
      paySign: 'MOCK_PAY_SIGN'
    }
  }, res)
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Campus Service API Server running on http://localhost:' + PORT)
})
