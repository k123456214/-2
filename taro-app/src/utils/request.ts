// src/utils/request.ts - 统一请求库（多端兼容）
import Taro from '@tarojs/taro'
import { getStorage, showToast, showLoading, hideLoading, navigateTo } from './index'

const BASE_URL = 'https://api.campus.example.com'
// 开发环境可切换为本地服务
// const BASE_URL = 'http://localhost:3000'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTION'
  data?: any
  header?: Record<string, string>
  mock?: boolean
  loading?: boolean
  silent?: boolean
}

// Mock 数据池（离线演示用）
const MOCK_DB: Record<string, any> = {
  user: { id: 10001, nickname: '校园用户', avatar: '', role: 'user', level: 1, points: 100, balance: 50.5 },
  merchants: Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: ['麦香汉堡', '鲜饮茶铺', '校园便利', '学霸文具', '快剪理发', '烧烤大师'][i],
    category: ['餐饮', '餐饮', '零售', '零售', '服务', '餐饮'][i],
    rating: 4.3 + Math.random() * 0.5,
    sales: Math.floor(100 + Math.random() * 1000),
    address: ['东门', '商业街', '宿舍区', '教学楼', '服务区', '西门'][i],
    phone: '138****8888',
    openTime: '09:00-22:00',
    deliveryFee: [3, 2, 2, 0, 0, 4][i],
    minOrder: [15, 10, 8, 5, 0, 20][i],
    description: '精选好货，品质保证'
  })),
  coupons: [
    { id: 1, name: '新人专享满20减5', type: '满减', minOrder: 20, discount: 5 },
    { id: 2, name: '周末特惠8折券', type: '折扣', minOrder: 30, discount: 0.8 },
    { id: 3, name: '全场通用券', type: '满减', minOrder: 50, discount: 10 }
  ]
}

function genGoods(shopId: number): any[] {
  const names = [
    ['招牌牛肉堡', '薯条', '可乐', '鸡米花', '鸡腿堡'],
    ['珍珠奶茶', '杨枝甘露', '柠檬茶', '芋泥波波', '芝士乌龙'],
    ['泡面', '矿泉水', '薯片', '饼干', '辣条'],
    ['中性笔', '笔记本', '文具盒', '橡皮', '文件夹'],
    ['剪发', '洗发', '造型', '烫染', '护理'],
    ['烤串', '烤翅', '烤韭菜', '烤茄子', '炒饭']
  ]
  const prices = [[28, 12, 5, 15, 22], [15, 18, 12, 16, 20], [6, 2, 8, 10, 5], [18, 15, 25, 5, 8], [25, 15, 30, 128, 88], [3, 8, 5, 10, 15]]
  return names[shopId - 1].map((name, idx) => ({
    id: shopId * 100 + idx,
    shopId,
    name,
    price: prices[shopId - 1][idx],
    originalPrice: prices[shopId - 1][idx] + 5,
    sales: Math.floor(Math.random() * 500),
    stock: Math.floor(Math.random() * 100),
    description: '新鲜制作，品质保证',
    attrs: [
      { name: '口味', type: 'select', options: ['原味', '香辣', '黑椒'], required: true },
      { name: '加料', type: 'multiselect', options: ['芝士', '培根', '鸡蛋', '番茄'], pricePerAddon: 3, maxSelect: 4 }
    ]
  }))
}

function handleMock(url: string, method: string, data: any): any {
  if (url.includes('/api/user/profile')) return MOCK_DB.user
  if (url.includes('/api/user/login')) return { token: 'mock_' + Date.now(), info: { ...MOCK_DB.user, nickname: data?.nickname || '校园用户' } }
  if (url.includes('/api/merchant/list')) return { list: MOCK_DB.merchants, total: MOCK_DB.merchants.length, page: 1, hasMore: false }
  if (url.includes('/api/merchant/detail')) {
    const id = parseInt(url.split('/').pop() || '1')
    const shop = MOCK_DB.merchants.find(m => m.id === id) || MOCK_DB.merchants[0]
    return { ...shop, goods: genGoods(shop.id) }
  }
  if (url.includes('/api/goods/list')) {
    const shopId = data?.shopId || 1
    return { list: genGoods(shopId), total: 5, page: 1, hasMore: false }
  }
  if (url.includes('/api/coupon')) return MOCK_DB.coupons
  if (url.includes('/api/order')) {
    return { id: 'OD' + Date.now(), status: 1, totalPrice: data?.totalPrice || 28, createdAt: Date.now() }
  }
  if (url.includes('/api/community/list')) return { list: [
    { id: 1, name: '校园篮球社', category: '运动', members: 328, posts: 1280, description: '篮球爱好者聚集地' },
    { id: 2, name: '编程与算法', category: '科技', members: 512, posts: 2100, description: '代码改变世界' },
    { id: 3, name: '摄影爱好社', category: '艺术', members: 156, posts: 680, description: '用镜头记录美好' },
    { id: 4, name: '校园吉他社', category: '音乐', members: 208, posts: 450, description: '音乐无国界' }
  ], total: 4, page: 1, hasMore: false }
  if (url.includes('/api/forum/boards')) return [
    { id: 1, name: '校园生活', posts: 5200 },
    { id: 2, name: '学习交流', posts: 3100 },
    { id: 3, name: '失物招领', posts: 890 },
    { id: 4, name: '求职招聘', posts: 420 }
  ]
  if (url.includes('/api/forum/list')) return { list: [
    { id: 1, title: '图书馆新增自习区域开放啦', author: '同学A', likes: 120, comments: 35, views: 1200, createdAt: Date.now() - 3600000 },
    { id: 2, title: '分享一份考研数学复习笔记', author: '学霸君', likes: 280, comments: 60, views: 3200, createdAt: Date.now() - 7200000 },
    { id: 3, title: '在食堂捡到一张校园卡', author: '好心人', likes: 5, comments: 2, views: 80, createdAt: Date.now() - 86400000 }
  ], total: 3, page: 1, hasMore: false }
  if (url.includes('/api/confession/list')) return { list: [
    { id: 1, content: '图书馆三楼靠窗第三排的女生，每天都能看到你专注的样子，你笑起来真的好好看。', likes: 128, comments: 32, author: '匿名', createdAt: Date.now() - 3600000 },
    { id: 2, content: '计算机学院的学长，上次帮我修电脑的那个，你说下次有问题再找我，我想...我可能又有问题了。', likes: 256, comments: 48, author: '匿名', createdAt: Date.now() - 7200000 },
    { id: 3, content: '致篮球场上12号球衣的男生：你的后仰跳投真的很帅！', likes: 88, comments: 12, author: '匿名', createdAt: Date.now() - 86400000 }
  ], total: 3, page: 1, hasMore: false }
  if (url.includes('/api/market/list')) return { list: [
    { id: 1, title: '九成新 MacBook Pro 2023', price: 6800, category: '数码', seller: '毕业学长', views: 320, createdAt: Date.now() - 86400000 },
    { id: 2, title: '高数教材 + 习题册一套', price: 30, category: '书籍', seller: '学姐', views: 120, createdAt: Date.now() - 172800000 },
    { id: 3, title: 'Nike 运动鞋 42码', price: 280, category: '服饰', seller: '同学D', views: 80, createdAt: Date.now() - 259200000 },
    { id: 4, title: '台灯 - 可调光护眼', price: 50, category: '生活用品', seller: '学长A', views: 60, createdAt: Date.now() - 345600000 }
  ], total: 4, page: 1, hasMore: false }
  if (url.includes('/api/errand')) return { list: [
    { id: 1, type: '取快递', title: '顺丰快递代取', fee: 5, publisher: '用户A', address: '南门菜鸟驿站', createdAt: Date.now() - 1800000 },
    { id: 2, type: '代买', title: '帮我买份晚饭', fee: 8, publisher: '用户B', address: '东门麦香汉堡', createdAt: Date.now() - 3600000 },
    { id: 3, type: '其他', title: '文件打印', fee: 10, publisher: '用户C', address: '打印店', createdAt: Date.now() - 86400000 }
  ], total: 3, page: 1, hasMore: false }
  return null
}

export async function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, header, mock = !BASE_URL.startsWith('http'), loading, silent } = options

  if (loading) showLoading()

  // 优先使用 mock
  if (mock) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const mockRes = handleMock(url, method, data)
    if (loading) hideLoading()
    return mockRes as T
  }

  try {
    const token = getStorage<string>('token', '')
    const res = await Taro.request({
      url: BASE_URL + url,
      method,
      data,
      header: Object.assign(
        { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' },
        header || {}
      ),
      timeout: 15000
    })

    if (loading) hideLoading()

    // 鉴权失败
    if (res.statusCode === 401) {
      showToast('请先登录')
      navigateTo('/pages/user/login/login')
      throw new Error('Unauthorized')
    }

    const body: any = res.data
    if (body.code === 0 || body.code === 200 || body.list) {
      return (body.data || body || null) as T
    }
    if (!silent) showToast(body.msg || '请求失败')
    throw new Error(body.msg || 'Request Failed')
  } catch (e: any) {
    if (loading) hideLoading()
    // 网络失败降级到 mock
    if (!silent) console.warn('[network fallback to mock]', url, e.message)
    return handleMock(url, method, data) as T
  }
}

export const http = {
  get: <T = any>(url: string, data?: any, opts: RequestOptions = {}): Promise<T> =>
    request(url, { method: 'GET', data, ...opts }),
  post: <T = any>(url: string, data?: any, opts: RequestOptions = {}): Promise<T> =>
    request(url, { method: 'POST', data, ...opts }),
  put: <T = any>(url: string, data?: any, opts: RequestOptions = {}): Promise<T> =>
    request(url, { method: 'PUT', data, ...opts }),
  delete: <T = any>(url: string, data?: any, opts: RequestOptions = {}): Promise<T> =>
    request(url, { method: 'DELETE', data, ...opts })
}
