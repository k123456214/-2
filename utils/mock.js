// utils/mock.js - Mock 数据服务
const storage = require('./storage.js')

// 内存数据池
let DB = {
  merchants: [
    { id: 1, name: '麦香汉堡', category: '餐饮', categoryId: 1, rating: 4.8, sales: 1200, address: '校园东门1号', phone: '13811110001', openTime: '09:00-22:00', deliveryFee: 3, minOrder: 15, logo: '', images: [], status: 1, owner: '张老板', description: '正宗汉堡薯条，校园第一味' },
    { id: 2, name: '鲜饮茶铺', category: '餐饮', categoryId: 1, rating: 4.6, sales: 850, address: '商业街B12', phone: '13811110002', openTime: '10:00-21:30', deliveryFee: 2, minOrder: 10, logo: '', images: [], status: 1, owner: '李老板', description: '新鲜果茶、奶茶饮品' },
    { id: 3, name: '校园便利超市', category: '零售', categoryId: 2, rating: 4.7, sales: 2100, address: '宿舍区5号楼', phone: '13811110003', openTime: '07:00-23:30', deliveryFee: 2, minOrder: 8, logo: '', images: [], status: 1, owner: '王老板', description: '日用品、零食、饮料' },
    { id: 4, name: '学霸文具', category: '零售', categoryId: 2, rating: 4.5, sales: 320, address: '教学楼A座', phone: '13811110004', openTime: '08:30-20:00', deliveryFee: 0, minOrder: 5, logo: '', images: [], status: 1, owner: '陈老板', description: '学习用品、笔记本' },
    { id: 5, name: '快剪理发店', category: '服务', categoryId: 3, rating: 4.4, sales: 180, address: '生活服务中心', phone: '13811110005', openTime: '10:00-21:00', deliveryFee: 0, minOrder: 0, logo: '', images: [], status: 1, owner: '刘师傅', description: '快剪、造型' }
  ],

  goods: [
    { id: 1, shopId: 1, name: '经典牛肉汉堡套餐', price: 28, originalPrice: 35, sales: 520, stock: 80, categoryId: 101, images: [], description: '牛肉汉堡+薯条+可乐', status: 1,
      attrs: [
        {
          name: '口味',
          type: 'select', // 多选
          options: ['原味', '香辣', '黑椒'],
          maxSelect: 2,
          required: true
        },
        {
          name: '加料',
          type: 'multiselect',
          options: ['芝士', '培根', '鸡蛋', '番茄', '生菜'],
          pricePerAddon: 3,
          maxSelect: 5
        },
        {
          name: '辣度(1-10)',
          type: 'number',
          min: 1,
          max: 10,
          step: 1,
          default: 5
        },
        {
          name: '备注',
          type: 'text',
          maxLength: 50
        }
      ]
    },
    { id: 2, shopId: 1, name: '双层芝士汉堡', price: 22, originalPrice: 26, sales: 310, stock: 50, categoryId: 101, images: [], description: '双层牛肉芝士', status: 1,
      attrs: [
        { name: '口味', type: 'select', options: ['原味', '香辣', '芥末'], maxSelect: 1, required: true }
      ]
    },
    { id: 3, shopId: 1, name: '薯条(大)', price: 12, originalPrice: 15, sales: 420, stock: 100, categoryId: 102, images: [], status: 1,
      attrs: [ { name: '份量', type: 'select', options: ['大份', '中份', '小份'], maxSelect: 1 } ]
    },
    { id: 4, shopId: 2, name: '珍珠奶茶', price: 15, originalPrice: 18, sales: 620, stock: 200, categoryId: 201, images: [], status: 1,
      attrs: [
        { name: '甜度', type: 'multiselect', options: ['少糖', '半糖', '正常糖'], maxSelect: 1, required: true },
        { name: '温度', type: 'select', options: ['冰', '常温', '热'], maxSelect: 1, required: true },
        { name: '加料数量', type: 'number', min: 0, max: 5, step: 1, default: 0 }
      ]
    },
    { id: 5, shopId: 3, name: '康师傅红烧牛肉面', price: 6, originalPrice: 8, sales: 1500, stock: 500, categoryId: 301, images: [], status: 1, attrs: [] },
    { id: 6, shopId: 3, name: '可口可乐(500ml)', price: 3.5, originalPrice: 4, sales: 2200, stock: 1000, categoryId: 302, images: [], status: 1, attrs: [] },
    { id: 7, shopId: 4, name: '晨光中性笔(12支)', price: 18, originalPrice: 24, sales: 120, stock: 80, categoryId: 401, images: [], status: 1,
      attrs: [
        { name: '颜色', type: 'multiselect', options: ['黑', '蓝', '红', '绿', '紫'], maxSelect: 3, required: true }
      ]
    },
    { id: 8, shopId: 5, name: '快剪洗剪吹', price: 25, originalPrice: 30, sales: 80, stock: -1, categoryId: 501, images: [], status: 1,
      attrs: [
        { name: '服务类型', type: 'select', options: ['快剪', '洗剪吹', '造型'], maxSelect: 1, required: true },
        { name: '服务时长', type: 'number', min: 15, max: 60, step: 5, default: 30 }
      ]
    }
  ],

  orders: [],
  orderSeq: 1000,

  communities: [
    { id: 1, name: '校园篮球社', category: '运动', members: 328, posts: 1280, logo: '', description: '篮球爱好者聚集地', status: 1, tags: ['运动', '篮球'] },
    { id: 2, name: '编程与算法', category: '科技', members: 512, posts: 2100, logo: '', description: '代码改变世界', status: 1, tags: ['科技', '编程'] },
    { id: 3, name: '摄影爱好社', category: '艺术', members: 156, posts: 680, logo: '', description: '用镜头记录美好', status: 1, tags: ['艺术', '摄影'] },
    { id: 4, name: '校园吉他社', category: '艺术', members: 208, posts: 450, logo: '', description: '音乐无国界', status: 1, tags: ['音乐', '吉他'] }
  ],

  communityPosts: [
    { id: 1, communityId: 1, userId: 10001, author: '小明', avatar: '', title: '今晚8点篮球场5v5', content: '有兴趣的同学在下面回帖，优先照顾社内成员。', likes: 25, comments: 18, views: 200, isEssence: true, createdAt: Date.now() - 3600000 },
    { id: 2, communityId: 2, userId: 10002, author: '代码王', avatar: '', title: '本周算法分享会 - 动态规划', content: '欢迎参加，分享一些经典 DP 题目', likes: 88, comments: 42, views: 520, isEssence: true, createdAt: Date.now() - 7200000 },
    { id: 3, communityId: 3, userId: 10003, author: '摄影师A', avatar: '', title: '春天校园风景作品分享', content: '校园樱花季到了，欢迎同学们一起参加外拍', likes: 55, comments: 20, views: 320, isEssence: false, createdAt: Date.now() - 86400000 }
  ],

  activities: [
    { id: 1, communityId: 1, title: '新生杯篮球赛', location: '校园体育馆', address: '校园东门', latitude: 39.908823, longitude: 116.397470, startTime: Date.now() + 86400000, endTime: Date.now() + 86400000 * 2, signupCount: 42, capacity: 100, fee: 0, description: '面向新生的篮球比赛活动' },
    { id: 2, communityId: 2, title: 'Hackathon编程马拉松', location: '创新大楼301', address: '创新大楼', latitude: 39.910, longitude: 116.400, startTime: Date.now() + 86400000 * 3, endTime: Date.now() + 86400000 * 3 + 86400000, signupCount: 88, capacity: 120, fee: 0, description: '48小时开发挑战' }
  ],

  forumBoards: [
    { id: 1, name: '校园生活', icon: '', desc: '校园点滴分享', posts: 5200 },
    { id: 2, name: '学习交流', icon: '', desc: '学习资料、经验', posts: 3100 },
    { id: 3, name: '失物招领', icon: '', desc: '失物、招领信息', posts: 890 },
    { id: 4, name: '求职招聘', icon: '', desc: '实习、校招', posts: 420 }
  ],

  forumPosts: [
    { id: 1, boardId: 1, author: '同学A', userId: 10001, avatar: '', title: '图书馆新增自习区域开放啦', content: '今天发现3楼新开放了一片自习区，安静明亮，推荐给需要备考的同学。', likes: 120, comments: 35, views: 1200, isTop: true, isHot: true, isEssence: true, createdAt: Date.now() - 3600000 },
    { id: 2, boardId: 2, author: '学霸君', userId: 10002, avatar: '', title: '分享一份考研数学复习笔记', content: '整理了近3年的真题分析，需要的同学自取', likes: 280, comments: 60, views: 3200, isTop: false, isHot: true, isEssence: true, createdAt: Date.now() - 7200000,
      vote: { title: '你最需要的科目？', options: [{id:1,text:'数学',count:88},{id:2,text:'英语',count:60},{id:3,text:'政治',count:30}] } },
    { id: 3, boardId: 3, author: '好心人', userId: 10003, avatar: '', title: '在食堂捡到一张校园卡', content: '姓名: 王同学，有认识的请联系', likes: 5, comments: 2, views: 80, isTop: false, isHot: false, isEssence: false, createdAt: Date.now() - 86400000 },
    { id: 4, boardId: 1, author: '吃货', userId: 10004, avatar: '', title: '盘点校园十大好吃的', content: '1. 东门汉堡...', likes: 95, comments: 48, views: 800, isTop: false, isHot: true, isEssence: false, createdAt: Date.now() - 86400000 * 2 }
  ],

  forumReplies: [
    { id: 1, postId: 1, author: '用户B', content: '太好了！正好需要', likes: 3, createdAt: Date.now() - 2000000 },
    { id: 2, postId: 1, author: '用户C', content: '感谢分享', likes: 1, createdAt: Date.now() - 1000000 }
  ],

  confessions: [
    { id: 1, content: '图书馆三楼靠窗第三排的女生，每天都能看到你专注的样子，你笑起来真的好好看，可以认识一下吗？', images: [], likes: 128, comments: 32, isAnonymous: true, createdAt: Date.now() - 3600000, author: '匿名' },
    { id: 2, content: '计算机学院的学长，上次帮我修电脑的那个，你说"下次有问题再找我"，我想...我可能又有问题了 :)', images: [], likes: 256, comments: 48, isAnonymous: true, createdAt: Date.now() - 7200000, author: '匿名' },
    { id: 3, content: '致篮球场上12号球衣的男生：你的后仰跳投真的很帅！', images: [], likes: 88, comments: 12, isAnonymous: true, createdAt: Date.now() - 86400000, author: '匿名' }
  ],

  marketGoods: [
    { id: 1, title: '九成新 MacBook Pro 2023', price: 6800, originalPrice: 14999, category: '数码', images: [], description: '自用一年，完好无磕碰，配件齐全', seller: '毕业学长', sellerId: 10005, views: 320, likes: 18, createdAt: Date.now() - 86400000, status: 1 },
    { id: 2, title: '高数教材 + 习题册一套', price: 30, originalPrice: 120, category: '书籍', images: [], description: '上学期用过的，笔记清晰', seller: '学姐', sellerId: 10006, views: 120, likes: 5, createdAt: Date.now() - 172800000, status: 1 },
    { id: 3, title: 'Nike 运动鞋 42码', price: 280, originalPrice: 799, category: '服饰', images: [], description: '穿过几次，尺码不合适', seller: '同学D', sellerId: 10007, views: 80, likes: 3, createdAt: Date.now() - 259200000, status: 1 },
    { id: 4, title: '台灯 - 可调光护眼', price: 50, originalPrice: 180, category: '生活用品', images: [], description: '毕业处理，宿舍用了一年', seller: '学长A', sellerId: 10008, views: 60, likes: 2, createdAt: Date.now() - 345600000, status: 1 }
  ],

  errandTasks: [
    { id: 1, type: '取快递', title: '顺丰快递代取', description: '南门菜鸟驿站，快递号: SF1234567890', pickup: '南门菜鸟驿站', delivery: '3号宿舍楼 501', fee: 5, status: 0, publisher: '用户A', publisherId: 10001, createdAt: Date.now() - 1800000 },
    { id: 2, type: '代买', title: '帮我买份晚饭', description: '东门麦香汉堡，点"经典牛肉汉堡套餐"，口味香辣', pickup: '麦香汉堡', delivery: '图书馆3楼', fee: 8, status: 1, publisher: '用户B', publisherId: 10002, runnerId: 20001, runnerName: '跑腿小哥', runnerPhone: '138****0001', createdAt: Date.now() - 3600000 },
    { id: 3, type: '其他', title: '文件打印', description: '需要A4黑白打印50张，送到教学楼', pickup: '打印店', delivery: '教学楼B201', fee: 10, status: 2, publisher: '用户C', publisherId: 10003, runnerId: 20002, runnerName: '勤工俭学', createdAt: Date.now() - 86400000 }
  ],

  coupons: [
    { id: 1, name: '新用户满20减5', type: '满减', minOrder: 20, discount: 5, validFrom: Date.now(), validTo: Date.now() + 86400000 * 30, total: 1000, used: 200 },
    { id: 2, name: '周末特惠8折券', type: '折扣', minOrder: 30, discount: 0.8, validFrom: Date.now(), validTo: Date.now() + 86400000 * 7, total: 500, used: 120 },
    { id: 3, name: '全场通用券', type: '满减', minOrder: 50, discount: 10, validFrom: Date.now(), validTo: Date.now() + 86400000 * 60, total: 2000, used: 800 }
  ],

  myCoupons: [],

  diyPages: [
    { id: 1, title: '校园风光', banner: '/images/bg/campus.jpg',
      components: [
        { type: 'title', content: '欢迎来到我们的校园' },
        { type: 'text', content: '这里是充满青春与梦想的地方，在这里每天都有新的故事。' },
        { type: 'image', src: '/images/bg/campus.jpg', url: '' },
        { type: 'button', text: '查看论坛', url: '/pages/forum/list/list' },
        { type: 'goods-list', goodsIds: [1, 2, 3] }
      ]
    },
    { id: 2, title: '新生入学指南', banner: '',
      components: [
        { type: 'title', content: '新生入学指南' },
        { type: 'richtext', content: '<p>欢迎新同学！以下是入学须知：</p><ul><li>报到时间：9月1日</li><li>报到地点：体育馆</li><li>携带材料：录取通知书、身份证</li></ul>' },
        { type: 'button', text: '查看地图', url: '' }
      ]
    },
    { id: 3, title: 'H5活动页', banner: '', isH5: true, h5Url: 'https://example.com/activity' }
  ]
}

// 持久化尝试恢复
try {
  const saved = storage.get('mock_db')
  if (saved) {
    DB = Object.assign(DB, saved)
  }
} catch (e) {}

function persist() {
  try {
    storage.set('mock_db', DB)
  } catch (e) {}
}

function formatTime(ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

function pad(n) { return n < 10 ? '0' + n : n }

function paginate(list, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  const data = list.slice(start, start + pageSize)
  return {
    list: data,
    total: list.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    hasMore: start + pageSize < list.length
  }
}

// 路由处理
const handlers = {
  'GET:/api/user/profile': (params) => {
    return { id: 10001, nickname: '校园用户', avatar: '/images/default-avatar.png', phone: '138****8888', role: 'user', level: 1, points: 100, balance: 50.5, memberSince: Date.now() - 86400000 * 30 }
  },
  'POST:/api/user/login': (data) => {
    return { token: 'mock_token_' + Date.now(), info: { id: 10001, nickname: data.nickname || '校园用户', avatar: '/images/default-avatar.png', role: 'user', level: 1, points: 100 } }
  },
  'PUT:/api/user/profile': (data) => data,
  'GET:/api/user/level': () => ({ level: 1, levelName: '初级会员', nextLevelPoints: 500, currentPoints: 100, privileges: ['积分购物', '优惠券领取'] }),

  // ========== 商户 ==========
  'POST:/api/merchant/apply': (data) => {
    data.id = Date.now()
    data.status = 0 // 0 待审核
    DB.merchants.push(data)
    persist()
    return { applyId: data.id, status: 'pending', message: '已提交，等待审核' }
  },
  'GET:/api/merchant/apply/status': () => ({ status: 'approved', message: '审核通过' }),
  'GET:/api/merchant/list': (p) => {
    let list = DB.merchants.filter(m => m.status === 1)
    if (p.category) list = list.filter(m => m.category === p.category)
    if (p.keyword) list = list.filter(m => m.name.includes(p.keyword))
    return paginate(list, p.page, p.pageSize)
  },
  'GET:/api/merchant/detail': (p, id) => {
    const m = DB.merchants.find(x => x.id == id)
    if (!m) return null
    const goods = DB.goods.filter(g => g.shopId == id && g.status === 1)
    return { ...m, goods }
  },
  'GET:/api/merchant/my-shop': () => DB.merchants[0] || null,
  'PUT:/api/merchant/my-shop': (data) => {
    const m = DB.merchants[0]
    if (m) Object.assign(m, data)
    persist()
    return m
  },
  'GET:/api/merchant/stats': () => ({
    todayOrders: 25, todaySales: 580.5, weekOrders: 180, weekSales: 4200, totalOrders: 1520, totalSales: 35000,
    dailyData: [
      { date: '周一', orders: 32, sales: 720 }, { date: '周二', orders: 28, sales: 640 },
      { date: '周三', orders: 45, sales: 980 }, { date: '周四', orders: 38, sales: 820 },
      { date: '周五', orders: 52, sales: 1150 }, { date: '周六', orders: 65, sales: 1420 },
      { date: '周日', orders: 48, sales: 1080 }
    ],
    topGoods: [
      { name: '经典牛肉汉堡', sales: 280, revenue: 7840 },
      { name: '珍珠奶茶', sales: 520, revenue: 7800 }
    ]
  }),

  // ========== 商品 ==========
  'GET:/api/goods/list': (p) => {
    let list = DB.goods.filter(g => g.status === 1)
    if (p.shopId) list = list.filter(g => g.shopId == p.shopId)
    if (p.categoryId) list = list.filter(g => g.categoryId == p.categoryId)
    if (p.keyword) list = list.filter(g => g.name.includes(p.keyword))
    return paginate(list, p.page, p.pageSize)
  },
  'GET:/api/goods/detail': (p, id) => DB.goods.find(g => g.id == id),
  'POST:/api/goods': (data) => {
    data.id = Date.now()
    data.sales = 0
    data.status = 1
    if (!data.attrs) data.attrs = []
    DB.goods.push(data)
    persist()
    return data
  },
  'PUT:/api/goods': (data) => {
    const g = DB.goods.find(x => x.id == data.id)
    if (g) Object.assign(g, data)
    persist()
    return g
  },
  'DELETE:/api/goods': (data, id) => {
    DB.goods = DB.goods.filter(g => g.id != id)
    persist()
    return { ok: true }
  },
  'GET:/api/goods/categories': () => [
    { id: 1, name: '餐饮', children: [{ id: 101, name: '主食' }, { id: 102, name: '小吃' }, { id: 103, name: '饮品' }] },
    { id: 2, name: '零售', children: [{ id: 201, name: '日用品' }, { id: 202, name: '零食' }] },
    { id: 3, name: '服务', children: [{ id: 301, name: '理发' }, { id: 302, name: '打印' }] }
  ],

  // ========== 订单 ==========
  'GET:/api/order/list': (p) => {
    let list = DB.orders.slice().reverse()
    if (p.status) list = list.filter(o => o.status == p.status)
    return paginate(list, p.page, p.pageSize)
  },
  'GET:/api/order/detail': (p, id) => DB.orders.find(o => o.id == id),
  'POST:/api/order': (data) => {
    const order = {
      id: 'OD' + (++DB.orderSeq),
      userId: 10001,
      shopId: data.shopId,
      shopName: data.shopName,
      goods: data.goods,
      totalPrice: data.totalPrice,
      deliveryFee: data.deliveryFee || 0,
      couponDiscount: data.couponDiscount || 0,
      payPrice: data.payPrice,
      address: data.address,
      remark: data.remark,
      status: 0, // 0 待支付 1 已支付/待接单 2 制作中 3 配送中 4 已完成 5 已取消
      createdAt: Date.now(),
      payTime: null,
      completedAt: null,
      logs: [{ time: Date.now(), status: '订单创建', text: '订单已创建，请尽快支付' }]
    }
    DB.orders.push(order)
    persist()
    return order
  },
  'POST:/api/order/pay': () => {
    const order = DB.orders[DB.orders.length - 1]
    if (order) {
      order.status = 1
      order.payTime = Date.now()
      order.logs.push({ time: Date.now(), status: '已支付', text: '支付成功，等待商家接单' })
      persist()
    }
    return { ok: true, payResult: 'success' }
  },
  'POST:/api/order/cancel': () => {
    const order = DB.orders[DB.orders.length - 1]
    if (order) { order.status = 5; order.logs.push({ time: Date.now(), status: '已取消', text: '订单已取消' }); persist() }
    return { ok: true }
  },
  'POST:/api/order/confirm': () => {
    const order = DB.orders[DB.orders.length - 1]
    if (order) {
      order.status = 4
      order.completedAt = Date.now()
      order.logs.push({ time: Date.now(), status: '已完成', text: '订单已完成' })
      persist()
    }
    return { ok: true }
  },
  'POST:/api/order/print': () => {
    // 通用云打印机 - 模拟
    return { ok: true, printers: DB.printers || [], printId: 'PR' + Date.now() }
  },
  'GET:/api/merchant/order/list': (p) => {
    return paginate(DB.orders.slice().reverse(), p.page, p.pageSize)
  },

  // ========== 跑腿 ==========
  'GET:/api/errand/list': (p) => paginate(DB.errandTasks.slice().reverse(), p.page, p.pageSize),
  'GET:/api/errand/detail': (p, id) => DB.errandTasks.find(t => t.id == id),
  'POST:/api/errand': (data) => {
    data.id = Date.now()
    data.status = 0
    data.publisherId = 10001
    data.publisher = '用户A'
    data.createdAt = Date.now()
    DB.errandTasks.push(data)
    persist()
    return data
  },
  'POST:/api/errand/accept': () => ({ ok: true }),
  'POST:/api/errand/complete': () => ({ ok: true }),
  'GET:/api/errand/location': () => ({ latitude: 39.908823, longitude: 116.397470, timestamp: Date.now() }),

  // ========== 社区 ==========
  'GET:/api/community/list': (p) => paginate(DB.communities, p.page, p.pageSize),
  'GET:/api/community/detail': (p, id) => DB.communities.find(c => c.id == id),
  'POST:/api/community': (data) => { data.id = Date.now(); data.members = 1; data.posts = 0; data.status = 1; DB.communities.push(data); persist(); return data },
  'POST:/api/community/join': () => ({ ok: true }),
  'GET:/api/community/posts': (p, id) => paginate(DB.communityPosts.filter(cp => cp.communityId == id), p.page, p.pageSize),
  'POST:/api/community/post': (data) => { data.id = Date.now(); data.createdAt = Date.now(); data.likes = 0; data.comments = 0; data.views = 0; DB.communityPosts.push(data); persist(); return data },
  'GET:/api/community/activities': (p) => paginate(DB.activities, p.page, p.pageSize),
  'POST:/api/community/activity/signup': () => ({ ok: true }),
  'POST:/api/community/activity/checkin': () => ({ ok: true }),

  // ========== 论坛 ==========
  'GET:/api/forum/boards': () => DB.forumBoards,
  'GET:/api/forum/list': (p) => {
    let list = DB.forumPosts.slice().sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || b.createdAt - a.createdAt)
    if (p.boardId) list = list.filter(f => f.boardId == p.boardId)
    if (p.keyword) list = list.filter(f => f.title.includes(p.keyword) || f.content.includes(p.keyword))
    return paginate(list, p.page, p.pageSize)
  },
  'GET:/api/forum/detail': (p, id) => {
    const post = DB.forumPosts.find(f => f.id == id)
    if (post) {
      post.replies = DB.forumReplies.filter(r => r.postId == id)
      return post
    }
    return null
  },
  'POST:/api/forum': (data) => { data.id = Date.now(); data.createdAt = Date.now(); data.likes = 0; data.comments = 0; data.views = 0; DB.forumPosts.push(data); persist(); return data },
  'POST:/api/forum/reply': (data, id) => { const r = { id: Date.now(), postId: id, author: '当前用户', content: data.content, likes: 0, createdAt: Date.now() }; DB.forumReplies.push(r); persist(); return r },
  'POST:/api/forum/like': () => ({ ok: true }),
  'POST:/api/forum/favorite': () => ({ ok: true }),
  'POST:/api/forum/vote': (data, id) => { const post = DB.forumPosts.find(f => f.id == id); if (post && post.vote) { const opt = post.vote.options.find(o => o.id == data.optionId); if (opt) opt.count++; } persist(); return { ok: true } },

  // ========== 表白墙 ==========
  'GET:/api/confession/list': (p) => paginate(DB.confessions.slice().sort((a, b) => b.createdAt - a.createdAt), p.page, p.pageSize),
  'GET:/api/confession/hot': (p) => paginate(DB.confessions.slice().sort((a, b) => b.likes - a.likes), p.page, p.pageSize),
  'POST:/api/confession': (data) => { data.id = Date.now(); data.likes = 0; data.comments = 0; data.createdAt = Date.now(); data.isAnonymous = true; data.author = '匿名'; DB.confessions.push(data); persist(); return data },
  'POST:/api/confession/like': () => ({ ok: true }),
  'POST:/api/confession/comment': () => ({ ok: true }),

  // ========== 二手市场 ==========
  'GET:/api/market/list': (p) => {
    let list = DB.marketGoods.filter(g => g.status === 1).sort((a, b) => b.createdAt - a.createdAt)
    if (p.category) list = list.filter(g => g.category === p.category)
    if (p.keyword) list = list.filter(g => g.title.includes(p.keyword))
    return paginate(list, p.page, p.pageSize)
  },
  'GET:/api/market/detail': (p, id) => DB.marketGoods.find(g => g.id == id),
  'POST:/api/market': (data) => { data.id = Date.now(); data.createdAt = Date.now(); data.views = 0; data.likes = 0; data.status = 1; DB.marketGoods.push(data); persist(); return data },
  'GET:/api/market/my-goods': (p) => paginate(DB.marketGoods, p.page, p.pageSize),
  'PUT:/api/market/offline': () => ({ ok: true }),
  'POST:/api/market/favorite': () => ({ ok: true }),
  'GET:/api/market/categories': () => ['数码', '书籍', '服饰', '生活用品', '体育用品', '其他'],

  // ========== 优惠券 ==========
  'GET:/api/coupon/list': () => DB.coupons,
  'GET:/api/coupon/my': () => DB.myCoupons,
  'POST:/api/coupon/receive': (data, id) => {
    const c = DB.coupons.find(x => x.id == id)
    if (c) {
      DB.myCoupons.push({ ...c, receivedAt: Date.now(), id: Date.now() })
      persist()
    }
    return { ok: true }
  },

  // ========== DIY ==========
  'GET:/api/diy/list': () => DB.diyPages,
  'GET:/api/diy/detail': (p, id) => DB.diyPages.find(d => d.id == id),

  // ========== 云打印机 ==========
  'GET:/api/printer/list': () => DB.printers || [],
  'POST:/api/printer': (data) => {
    if (!DB.printers) DB.printers = []
    data.id = Date.now()
    data.status = 'online'
    DB.printers.push(data)
    persist()
    return data
  },
  'POST:/api/printer/print': (data) => {
    // 模拟通用云打印接口调用
    return { ok: true, printId: 'PRT' + Date.now(), timestamp: Date.now() }
  }
}

module.exports = {
  handle(url, method, data) {
    // 提取id模式: /api/xxx/{id}/yyy
    let key = (method || 'GET').toUpperCase() + ':' + url
    // 尝试直接匹配
    if (handlers[key]) return handlers[key](data)

    // 尝试按 id 模式匹配
    const parts = url.split('/').filter(Boolean)
    for (let i = 0; i < parts.length; i++) {
      // 尝试把最后一个部分当 ID
      const testParts = parts.slice(0, parts.length - i).join('/')
      const id = parts[parts.length - i - 1]
      if (i >= 1) {
        const tryKey = (method || 'GET').toUpperCase() + ':/' + testParts
        if (handlers[tryKey]) return handlers[tryKey](data, id)
      }
    }

    // 尝试更宽松匹配 - 去掉最后一节
    for (let i = 1; i < parts.length; i++) {
      const tryUrl = '/' + parts.slice(0, parts.length - i).join('/')
      const tryKey = (method || 'GET').toUpperCase() + ':' + tryUrl
      if (handlers[tryKey]) {
        return handlers[tryKey](data, parts.slice(parts.length - i).join('/'))
      }
    }

    console.warn('No mock handler for:', key)
    return null
  }
}
