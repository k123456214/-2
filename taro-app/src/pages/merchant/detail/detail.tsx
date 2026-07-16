import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function MerchantDetail() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [merchant, setMerchant] = useState<any>(null)
  const [goods, setGoods] = useState<any[]>([])

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const [m, g] = await Promise.all([api.merchant.detail(id), api.goods.list({ merchantId: id })])
      setMerchant(m)
      setGoods((g as any).list || g || [])
    } catch (e) { console.error(e) }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <View className="hero-logo">🏪</View>
        <Text className="hero-title">{merchant?.name || '校园美食'}</Text>
        <Text className="hero-sub">{merchant?.category || '中餐'} · ★ {Number(merchant?.rating || 4.8).toFixed(1)}</Text>
        <View className="hero-stats">
          <View className="stat-item"><Text className="stat-num">{merchant?.sales || 100}</Text><Text className="stat-label">月销</Text></View>
          <View className="stat-item"><Text className="stat-num">{goods.length}</Text><Text className="stat-label">商品</Text></View>
          <View className="stat-item"><Text className="stat-num">{Number(merchant?.rating || 4.8).toFixed(1)}</Text><Text className="stat-label">评分</Text></View>
        </View>
      </View>

      <View className="card">
        <Text className="card-title">📝 商户介绍</Text>
        <Text className="desc">{merchant?.desc || '用心做好每一份美食，校园配送快速准时，新鲜食材，干净卫生。'}</Text>
      </View>

      <View className="card">
        <Text className="card-title">📍 店铺信息</Text>
        <View className="info-row"><Text className="info-label">地址</Text><Text className="info-value">{merchant?.address || '校园综合服务中心'}</Text></View>
        <View className="info-row"><Text className="info-label">营业时间</Text><Text className="info-value">{merchant?.hours || '09:00 - 22:00'}</Text></View>
        <View className="info-row"><Text className="info-label">联系电话</Text><Text className="info-value">{merchant?.phone || '13800138000'}</Text></View>
        <View className="info-row"><Text className="info-label">起送价</Text><Text className="info-value">¥{merchant?.minOrder || 15}</Text></View>
        <View className="info-row"><Text className="info-label">配送费</Text><Text className="info-value">¥{merchant?.deliveryFee || 3}</Text></View>
      </View>

      <View className="card">
        <Text className="card-title">🛍 热销商品</Text>
        {goods.slice(0, 6).map((g: any) => (
          <View key={g.id} className="goods-item">
            <View className="goods-thumb">🍜</View>
            <View className="goods-info">
              <Text className="goods-name">{g.name}</Text>
              <Text className="goods-desc">{g.desc || '美味可口'}</Text>
              <Text className="goods-price">¥{g.price}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="action-row">
        <Button className="btn-outline" onClick={() => Taro.navigateTo({ url: '/pages/merchant/list/list' })}>返回列表</Button>
        <Button className="btn-primary" onClick={() => Taro.navigateTo({ url: '/pages/food/shop/shop?shopId=' + id })}>进入店铺</Button>
      </View>
    </ScrollView>
  )
}
