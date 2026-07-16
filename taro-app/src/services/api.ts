// src/services/api.ts - 业务 API 聚合
import { http } from '../utils/request'

export const api = {
  user: {
    profile: () => http.get('/api/user/profile'),
    login: (data: any) => http.post('/api/user/login', data),
    update: (data: any) => http.put('/api/user/profile', data),
    levelInfo: () => http.get('/api/user/level-info')
  },
  merchant: {
    list: (p?: any) => http.get('/api/merchant/list', p),
    detail: (id: number | string) => http.get('/api/merchant/detail/' + id),
    apply: (data: any) => http.post('/api/merchant/apply', data),
    myShop: () => http.get('/api/merchant/my-shop'),
    stats: () => http.get('/api/merchant/stats')
  },
  goods: {
    list: (p?: any) => http.get('/api/goods/list', p),
    detail: (id: number | string) => http.get('/api/goods/detail/' + id),
    create: (data: any) => http.post('/api/goods', data),
    update: (id: number, data: any) => http.put('/api/goods/' + id, data),
    remove: (id: number) => http.delete('/api/goods/' + id),
    toggleStatus: (id: number, status: number) => http.put('/api/goods/' + id + '/status', { status })
  },
  order: {
    list: (p?: any) => http.get('/api/order/list', p),
    detail: (id: number | string) => http.get('/api/order/detail/' + id),
    create: (data: any) => http.post('/api/order', data),
    pay: (id: number | string) => http.post('/api/order/' + id + '/pay'),
    cancel: (id: number | string) => http.post('/api/order/' + id + '/cancel'),
    confirm: (id: number | string) => http.post('/api/order/' + id + '/confirm')
  },
  coupon: {
    list: () => http.get('/api/coupon/list'),
    myCoupons: () => http.get('/api/coupon/my'),
    receive: (id: number) => http.post('/api/coupon/' + id + '/receive')
  },
  community: {
    list: (p?: any) => http.get('/api/community/list', p),
    detail: (id: number) => http.get('/api/community/detail/' + id),
    create: (data: any) => http.post('/api/community', data),
    join: (id: number) => http.post('/api/community/' + id + '/join'),
    posts: (id: number, p?: any) => http.get('/api/community/' + id + '/posts', p),
    activities: (p?: any) => http.get('/api/community/activities', p)
  },
  forum: {
    boards: () => http.get('/api/forum/boards'),
    list: (p?: any) => http.get('/api/forum/list', p),
    detail: (id: number) => http.get('/api/forum/detail/' + id),
    create: (data: any) => http.post('/api/forum', data),
    like: (id: number) => http.post('/api/forum/' + id + '/like'),
    favorite: (id: number) => http.post('/api/forum/' + id + '/favorite'),
    reply: (id: number, data: any) => http.post('/api/forum/' + id + '/reply', data)
  },
  confession: {
    list: (p?: any) => http.get('/api/confession/list', p),
    detail: (id: number) => http.get('/api/confession/detail/' + id),
    create: (data: any) => http.post('/api/confession', data),
    comment: (id: number, data: any) => http.post('/api/confession/' + id + '/comment', data),
    like: (id: number) => http.post('/api/confession/' + id + '/like')
  },
  market: {
    list: (p?: any) => http.get('/api/market/list', p),
    detail: (id: number) => http.get('/api/market/detail/' + id),
    create: (data: any) => http.post('/api/market', data),
    myGoods: (p?: any) => http.get('/api/market/my-goods', p),
    favorite: (id: number) => http.post('/api/market/' + id + '/favorite')
  },
  errand: {
    list: (p?: any) => http.get('/api/errand/list', p),
    detail: (id: number) => http.get('/api/errand/detail/' + id),
    create: (data: any) => http.post('/api/errand', data),
    accept: (id: number) => http.post('/api/errand/' + id + '/accept'),
    complete: (id: number) => http.post('/api/errand/' + id + '/complete')
  },
  diy: {
    list: () => http.get('/api/diy/list'),
    detail: (id: number) => http.get('/api/diy/detail/' + id)
  }
}

export default api
