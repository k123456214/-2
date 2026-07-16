import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

interface Merchant { id: number; name: string; category: string; rating: number; sales: number; address: string }

export default function MerchantList() {
  const [list, setList] = useState<Merchant[]>([])
  const [keyword, setKeyword] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const r = await api.merchant.list()
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onTap(id: number) { Taro.navigateTo({ url: '/pages/merchant/detail/detail?id=' + id }) }
  function onApply() { Taro.navigateTo({ url: '/pages/merchant/apply/apply' }) }

  const filtered = list.filter(m => !keyword || m.name.includes(keyword) || m.category.includes(keyword))

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="header">
        <Text className="header-title">🏪 商户中心</Text>
        <View className="search-bar">
          <Text className="search-icon">🔍</Text>
          <Input
            className="search-input"
            placeholder="搜索商户"
            value={keyword}
            onInput={(e: any) => setKeyword(e.detail.value)}
          />
        </View>
      </View>

      <View className="quick-row">
        <View className="quick-item" onClick={onApply}>
          <Text className="quick-icon">✍️</Text>
          <Text className="quick-text">入驻申请</Text>
        </View>
        <View className="quick-item" onClick={() => Taro.navigateTo({ url: '/pages/merchant/my-shop/my-shop' })}>
          <Text className="quick-icon">🏬</Text>
          <Text className="quick-text">我的店铺</Text>
        </View>
        <View className="quick-item" onClick={() => Taro.navigateTo({ url: '/pages/merchant/goods-manage/goods-manage' })}>
          <Text className="quick-icon">📦</Text>
          <Text className="quick-text">商品管理</Text>
        </View>
        <View className="quick-item" onClick={() => Taro.navigateTo({ url: '/pages/merchant/order-manage/order-manage' })}>
          <Text className="quick-icon">📋</Text>
          <Text className="quick-text">订单管理</Text>
        </View>
      </View>

      <View className="card">
        <Text className="card-title">🔥 精选商户</Text>
        {filtered.map(m => (
          <View key={m.id} className="merchant-item" onClick={() => onTap(m.id)}>
            <View className="merchant-thumb">🏪</View>
            <View className="merchant-info">
              <View className="merchant-top">
                <Text className="merchant-name">{m.name}</Text>
                <Text className="rating">★ {Number(m.rating).toFixed(1)}</Text>
              </View>
              <Text className="merchant-meta">{m.category} · 月销{m.sales}</Text>
              <Text className="merchant-address">{m.address}</Text>
            </View>
          </View>
        ))}
        {filtered.length === 0 && <View className="empty"><Text>暂无商户</Text></View>}
      </View>
    </ScrollView>
  )
}
