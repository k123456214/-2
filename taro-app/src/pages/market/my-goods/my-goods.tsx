import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface Goods { id: number; title: string; price: number; originalPrice: number; status: string; views: number; createdAt: number }

export default function MyGoods() {
  const [list, setList] = useState<Goods[]>([])
  const [tab, setTab] = useState('all')

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    try {
      const r = await api.market.myGoods()
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onEdit(id: number) { Taro.navigateTo({ url: '/pages/market/publish/publish?id=' + id }) }
  function onRemove(id: number) {
    Taro.showModal({ title: '提示', content: '确认删除?', success: (res) => { if (res.confirm) { setList(prev => prev.filter(x => x.id !== id)); showToast('已删除', 'success') } } })
  }

  const statusColor: Record<string, string> = { on: '#52c41a', off: '#999', sold: '#f5222d' }
  const statusText: Record<string, string> = { on: '在售', off: '已下架', sold: '已售出' }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="tab-bar">
        {[{ k: 'all', t: '全部' }, { k: 'on', t: '在售' }, { k: 'off', t: '下架' }, { k: 'sold', t: '已售' }].map(x => (
          <View key={x.k} className={'tab' + (tab === x.k ? ' active' : '')} onClick={() => setTab(x.k)}>
            <Text>{x.t}</Text>
          </View>
        ))}
      </View>

      {list.map((g: Goods) => (
        <View key={g.id} className="goods-card">
          <View className="goods-image">📦</View>
          <View className="goods-body">
            <Text className="goods-title">{g.title}</Text>
            <View className="price-row">
              <Text className="price">{formatPrice(g.price)}</Text>
              <Text className="original-price">{formatPrice(g.originalPrice)}</Text>
            </View>
            <View className="goods-meta">
              <Text className="views">👁 {g.views || 0} 浏览</Text>
              <Text className="status" style={{ color: statusColor[g.status] || '#999' }}>{statusText[g.status] || '在售'}</Text>
            </View>
            <View className="btn-row">
              <Button className="mini-btn" onClick={() => onEdit(g.id)}><Text>编辑</Text></Button>
              <Button className="mini-btn-danger" onClick={() => onRemove(g.id)}><Text>删除</Text></Button>
            </View>
          </View>
        </View>
      ))}

      {list.length === 0 && <View className="empty"><Text className="empty-icon">📦</Text><Text>还没有发布商品</Text></View>}

      <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/market/publish/publish' })}>
        <Text style={{ color: '#fff', fontSize: 44 }}>+</Text>
      </View>
    </ScrollView>
  )
}
