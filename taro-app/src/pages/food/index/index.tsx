import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Swiper, SwiperItem, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface Merchant { id: number; name: string; category: string; rating: number; sales: number; address: string; minOrder: number; deliveryFee: number }

export default function FoodIndex() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [keyword, setKeyword] = useState('')
  const [activeCat, setActiveCat] = useState('全部')
  const categories = ['全部', '快餐', '汉堡', '奶茶', '咖啡', '小吃', '甜品', '中式', '日式', '韩式']

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const r = await api.merchant.list({ category: activeCat === '全部' ? undefined : activeCat })
      setMerchants((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onCatTap(c: string) { setActiveCat(c); loadData() }
  function onShopTap(id: number) { Taro.navigateTo({ url: '/pages/food/shop/shop?shopId=' + id }) }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="food-header">
        <View className="food-title">
          <Text className="food-title-text">🍔 外卖点餐</Text>
        </View>
        <View className="search-bar">
          <Text className="search-icon">🔍</Text>
          <Input
            className="search-input"
            placeholder="搜索商户 / 商品"
            value={keyword}
            onInput={(e: any) => setKeyword(e.detail.value)}
            confirmType="search"
          />
        </View>
      </View>

      <Swiper className="banner" autoplay circular indicatorDots indicatorActiveColor="#fff">
        <SwiperItem><View className="banner-item"><Text>🎉 新用户立减10元</Text></View></SwiperItem>
        <SwiperItem><View className="banner-item banner-orange"><Text>🚚 满30免配送费</Text></View></SwiperItem>
        <SwiperItem><View className="banner-item banner-green"><Text>⏰ 限时秒杀活动</Text></View></SwiperItem>
      </Swiper>

      <ScrollView scrollX className="cat-scroll">
        {categories.map(c => (
          <View
            key={c}
            className={'cat-item' + (c === activeCat ? ' cat-active' : '')}
            onClick={() => onCatTap(c)}
          >
            <Text>{c}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="merchant-list">
        {merchants.map((m: Merchant) => (
          <View key={m.id} className="shop-card" onClick={() => onShopTap(m.id)}>
            <View className="shop-thumb">🏪</View>
            <View className="shop-info">
              <View className="shop-info-top">
                <Text className="shop-name">{m.name}</Text>
                <Text className="shop-rating">★ {Number(m.rating).toFixed(1)}</Text>
              </View>
              <Text className="shop-desc">{m.category} · 月销{m.sales}单</Text>
              <View className="shop-meta">
                <Text className="shop-meta-item">起送 {formatPrice(m.minOrder)}</Text>
                <Text className="shop-meta-item">配送 {formatPrice(m.deliveryFee)}</Text>
                <Text className="shop-meta-item shop-address">{m.address}</Text>
              </View>
            </View>
          </View>
        ))}
        {merchants.length === 0 && (
          <View className="empty"><Text className="empty-icon">🍽️</Text><Text>暂无商户</Text></View>
        )}
      </View>
    </ScrollView>
  )
}
