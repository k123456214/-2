import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { formatPrice, timeAgo } from '../../../utils'
import './index.scss'

interface Goods { id: number; title: string; price: number; originalPrice: number; seller: string; location: string; createdAt: number; category: string }

export default function MarketList() {
  const [list, setList] = useState<Goods[]>([])
  const [keyword, setKeyword] = useState('')
  const [cat, setCat] = useState('全部')
  const cats = ['全部', '数码', '教材', '生活用品', '服饰', '运动', '美妆', '其他']

  useEffect(() => { loadData() }, [cat])

  async function loadData() {
    try {
      const r = await api.market.list({ category: cat === '全部' ? undefined : cat })
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onDetail(id: number) { Taro.navigateTo({ url: '/pages/market/detail/detail?id=' + id }) }
  function onPublish() { Taro.navigateTo({ url: '/pages/market/publish/publish' }) }
  function onMyGoods() { Taro.navigateTo({ url: '/pages/market/my-goods/my-goods' }) }

  const filtered = list.filter(g => !keyword || g.title.includes(keyword))

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">🛍️ 二手市集</Text>
        <Text className="hero-sub">发现好物，闲置变宝</Text>
        <View className="search-bar">
          <Text className="search-icon">🔍</Text>
          <Input className="search-input" placeholder="搜索商品..." value={keyword} onInput={(e: any) => setKeyword(e.detail.value)} confirmType="search" />
        </View>
      </View>

      <ScrollView scrollX className="cat-bar">
        {cats.map(c => (
          <View key={c} className={'cat-item' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>
            <Text>{c}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="quick-row">
        <View className="quick-item" onClick={onPublish}>
          <Text className="quick-icon">💰</Text>
          <Text className="quick-text">发布闲置</Text>
        </View>
        <View className="quick-item" onClick={onMyGoods}>
          <Text className="quick-icon">📦</Text>
          <Text className="quick-text">我的发布</Text>
        </View>
        <View className="quick-item" onClick={() => Taro.navigateTo({ url: '/pages/user/favorite/favorite' })}>
          <Text className="quick-icon">❤️</Text>
          <Text className="quick-text">我的收藏</Text>
        </View>
        <View className="quick-item" onClick={() => {}}>
          <Text className="quick-icon">⭐</Text>
          <Text className="quick-text">超值推荐</Text>
        </View>
      </View>

      <View className="grid">
        {filtered.map((g: Goods) => (
          <View key={g.id} className="goods-card" onClick={() => onDetail(g.id)}>
            <View className="goods-image">📦</View>
            <Text className="goods-title">{g.title}</Text>
            <View className="price-row">
              <Text className="price">{formatPrice(g.price)}</Text>
              <Text className="original-price">{formatPrice(g.originalPrice)}</Text>
            </View>
            <View className="goods-meta">
              <Text className="location">📍 {g.location}</Text>
              <Text className="time">{timeAgo(g.createdAt)}</Text>
            </View>
          </View>
        ))}
      </View>

      {filtered.length === 0 && <View className="empty"><Text className="empty-icon">🛍️</Text><Text>暂无商品</Text></View>}

      <View className="fab" onClick={onPublish}>
        <Text style={{ color: '#fff', fontSize: 44 }}>+</Text>
      </View>
    </ScrollView>
  )
}
