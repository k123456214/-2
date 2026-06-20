import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { api } from '../../services/api'
import { showToast } from '../../utils'
import './index.scss'

interface Merchant { id: number; name: string; category: string; rating: number; sales: number; address: string }
interface Goods { id: number; name: string; price: number }
interface Post { id: number; title: string; author: string; likes: number; comments: number; createdAt: number }

export default function Index() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [goods, setGoods] = useState<Goods[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [coupons, setCoupons] = useState<any[]>([])

  useEffect(() => {
    initData()
  }, [])

  async function initData() {
    try {
      const [m, g, p, c] = await Promise.all([
        api.merchant.list(),
        api.goods.list(),
        api.forum.list(),
        api.coupon.list()
      ])
      setMerchants((m as any).list || m || [])
      setGoods((g as any).list || g || [])
      setPosts((p as any).list || p || [])
      setCoupons(c || [])
    } catch (e) {
      console.error(e)
    }
  }

  function onMerchantTap(id: number) {
    Taro.navigateTo({ url: '/pages/food/shop/shop?shopId=' + id })
  }

  function onForumTap(id: number) {
    Taro.navigateTo({ url: '/pages/forum/detail/detail?id=' + id })
  }

  function onMarketTap() { Taro.switchTab({ url: '/pages/community/list/list' }).catch(() => Taro.navigateTo({ url: '/pages/market/list/list' })) }

  const categories = [
    { icon: '🍔', name: '外卖点餐', url: '/pages/food/index/index', color: '#ff7a45' },
    { icon: '🛍️', name: '二手市场', url: '/pages/market/list/list', color: '#52c41a' },
    { icon: '💌', name: '表白墙', url: '/pages/confession/list/list', color: '#f5222d' },
    { icon: '📚', name: '校园论坛', url: '/pages/forum/list/list', color: '#1890ff' },
    { icon: '🎯', name: '兴趣社区', url: '/pages/community/list/list', color: '#722ed1' },
    { icon: '🏃', name: '跑腿服务', url: '/pages/errand/list/list', color: '#fa8c16' },
    { icon: '🏪', name: '商户入驻', url: '/pages/merchant/apply/apply', color: '#13c2c2' },
    { icon: '✨', name: '自定义', url: '/pages/custom/diy/diy?id=1', color: '#eb2f96' }
  ]

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="header">
        <View className="header-title">
          <Text>🎓 校园综合服务</Text>
        </View>
        <View className="search-bar">
          <Text className="search-icon">🔍</Text>
          <Text className="search-text">搜索商品、帖子、社区...</Text>
        </View>
      </View>

      <Swiper className="banner" autoplay circular indicatorDots indicatorActiveColor="#fff">
        <SwiperItem>
          <View className="banner-item"><Text>🎉 外卖新上线，下单立减</Text></View>
        </SwiperItem>
        <SwiperItem>
          <View className="banner-item banner-orange"><Text>💌 表白墙，说出你的心声</Text></View>
        </SwiperItem>
        <SwiperItem>
          <View className="banner-item banner-green"><Text>🛍️ 二手市场，发现好物</Text></View>
        </SwiperItem>
      </Swiper>

      <View className="card">
        <View className="grid">
          {categories.map(cat => (
            <View key={cat.name} className="grid-item" onClick={() => Taro.navigateTo({ url: cat.url })}>
              <View className="grid-icon" style={{ background: cat.color + '22', color: cat.color }}>
                <Text>{cat.icon}</Text>
              </View>
              <Text className="grid-name">{cat.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {coupons.length > 0 && (
        <View className="card">
          <View className="card-header">
            <Text className="card-title">🎟️ 优惠券</Text>
            <Text className="text-light text-sm">全部 ›</Text>
          </View>
          <ScrollView scrollX className="coupon-scroll">
            {coupons.slice(0, 4).map(c => (
              <View key={c.id} className="coupon-card">
                <View className="coupon-price">
                  <Text className="text-bold" style={{ color: '#f5222d' }}>{c.type === '满减' ? '¥' + c.discount : (c.discount * 10).toFixed(1) + '折'}</Text>
                </View>
                <View className="coupon-info">
                  <Text className="text-sm text-bold">{c.name}</Text>
                  <Text className="text-sm text-light">满¥{c.minOrder}可用</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="card">
        <View className="card-header">
          <Text className="card-title">🔥 热门商户</Text>
          <Text className="text-light text-sm" onClick={() => Taro.navigateTo({ url: '/pages/merchant/list/list' })}>查看更多 ›</Text>
        </View>
        {merchants.map(m => (
          <View key={m.id} className="merchant-item" onClick={() => onMerchantTap(m.id)}>
            <View className="thumb">🏪</View>
            <View style={{ flex: 1, marginLeft: 20 }}>
              <View className="flex-between">
                <Text className="text-bold">{m.name}</Text>
                <Text className="rating">★ {Number(m.rating).toFixed(1)}</Text>
              </View>
              <Text className="text-sm text-light mt-10">{m.address} · 月销{m.sales}</Text>
              <View className="mt-10">
                <Text className="tag">{m.category}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="card">
        <View className="card-header">
          <Text className="card-title">💬 校园热议</Text>
        </View>
        {posts.map(p => (
          <View key={p.id} className="forum-item" onClick={() => onForumTap(p.id)}>
            <Text className="text-bold text-lg">{p.title}</Text>
            <View className="flex-between mt-10">
              <Text className="text-sm text-light">{p.author}</Text>
              <View className="forum-meta">
                <Text className="text-sm text-light">👍 {p.likes}</Text>
                <Text className="text-sm text-light ml-20">💬 {p.comments}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="footer-note">
        <Text>— 我是有底线的 —</Text>
      </View>
    </ScrollView>
  )
}
