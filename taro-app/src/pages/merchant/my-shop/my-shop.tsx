import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

export default function MyShop() {
  const [shop, setShop] = useState<any>(null)
  const [stats, setStats] = useState<any>({ today: 0, total: 0, orders: 0, rating: 4.8 })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [s, st] = await Promise.all([api.merchant.myShop(), api.merchant.stats()])
      setShop(s)
      if (st) setStats({ today: st.today || 0, total: st.total || 0, orders: st.orders || 0, rating: st.rating || 4.8 })
    } catch (e) { console.error(e) }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="shop-card">
        <View className="shop-head">
          <View className="shop-logo">🏪</View>
          <View className="shop-head-info">
            <Text className="shop-name">{shop?.name || '我的店铺'}</Text>
            <View className="shop-status"><Text className="status-dot" /><Text>营业中</Text></View>
          </View>
        </View>
        <View className="shop-stats">
          <View className="stat-box"><Text className="stat-num">{formatPrice(stats.today)}</Text><Text className="stat-label">今日营业额</Text></View>
          <View className="stat-box"><Text className="stat-num">{stats.orders}</Text><Text className="stat-label">订单数</Text></View>
          <View className="stat-box"><Text className="stat-num">{formatPrice(stats.total)}</Text><Text className="stat-label">累计营业额</Text></View>
        </View>
      </View>

      <View className="card">
        <Text className="card-title">🔧 店铺管理</Text>
        {[
          { icon: '📦', name: '商品管理', url: '/pages/merchant/goods-manage/goods-manage' },
          { icon: '✏️', name: '添加商品', url: '/pages/merchant/goods-edit/goods-edit?id=0' },
          { icon: '📋', name: '订单管理', url: '/pages/merchant/order-manage/order-manage' },
          { icon: '👁️', name: '店铺预览', url: '/pages/food/shop/shop?shopId=' + (shop?.id || 1) },
        ].map((item, idx) => (
          <View key={idx} className="menu-item" onClick={() => Taro.navigateTo({ url: item.url })}>
            <Text className="menu-icon">{item.icon}</Text>
            <Text className="menu-name">{item.name}</Text>
            <Text className="menu-arrow">›</Text>
          </View>
        ))}
      </View>

      <View className="card">
        <Text className="card-title">📊 店铺信息</Text>
        <View className="info-row"><Text className="info-label">店铺类目</Text><Text className="info-value">{shop?.category || '快餐'}</Text></View>
        <View className="info-row"><Text className="info-label">评分</Text><Text className="info-value">★ {stats.rating}</Text></View>
        <View className="info-row"><Text className="info-label">地址</Text><Text className="info-value">{shop?.address || '校园综合服务中心'}</Text></View>
        <View className="info-row"><Text className="info-label">联系电话</Text><Text className="info-value">{shop?.phone || '13800138000'}</Text></View>
      </View>
    </ScrollView>
  )
}
