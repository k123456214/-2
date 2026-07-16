import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice, formatTime } from '../../../utils'
import './index.scss'

export default function MarketDetail() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [detail, setDetail] = useState<any>(null)
  const [fav, setFav] = useState(false)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const d = await api.market.detail(id)
      setDetail(d)
    } catch (e) { console.error(e) }
  }

  async function favorite() {
    try {
      await api.market.favorite(id)
      setFav(true)
      showToast('已收藏', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  function contact() { showToast('已发送消息', 'success') }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="image-box">
        <Text className="image-emoji">📦</Text>
      </View>

      <View className="info-card">
        <Text className="price">{formatPrice(detail?.price || 0)}</Text>
        <Text className="original-price">{formatPrice(detail?.originalPrice || 0)}</Text>
        <Text className="title">{detail?.title || '商品标题'}</Text>
        <Text className="desc">{detail?.desc || '商品描述'}</Text>
        <View className="meta-row">
          <Text className="meta-item">📍 {detail?.location || '校内'}</Text>
          <Text className="meta-item">📅 {formatTime(new Date(detail?.createdAt || Date.now()))}</Text>
        </View>
      </View>

      <View className="seller-card">
        <View className="seller-avatar">{(detail?.seller || 'S')[0]}</View>
        <View className="seller-body">
          <Text className="seller-name">{detail?.seller || '卖家'}</Text>
          <Text className="seller-desc">诚信卖家 · 评分 4.9</Text>
        </View>
        <Button className="seller-btn" onClick={contact}><Text>联系</Text></Button>
      </View>

      <View className="desc-card">
        <Text className="desc-title">📝 商品描述</Text>
        <Text className="desc-text">{detail?.fullDesc || detail?.desc || '成色九成新，功能完好，低价转让，非诚勿扰。校内当面交易，支持验货。'}</Text>
      </View>

      <View className="action-bar">
        <View className="action-item" onClick={favorite}>
          <Text className="action-icon">{fav ? '❤️' : '🤍'}</Text>
          <Text className="action-text">{fav ? '已收藏' : '收藏'}</Text>
        </View>
        <Button className="chat-btn" onClick={contact}><Text>💬 咨询</Text></Button>
        <Button className="buy-btn" onClick={() => showToast('已下单，请等待卖家确认', 'success')}><Text>¥ 立即购买</Text></Button>
      </View>
    </ScrollView>
  )
}
