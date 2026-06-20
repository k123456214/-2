import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../../services/api'
import { showToast, formatPrice, formatTime } from '../../../../utils'
import './my-order.scss'

interface Order { id: number; orderNo: string; status: string; total: number; createdAt: number; items: { name: string; qty: number; price: number }[] }

export default function MyOrder() {
  const router = Taro.useRouter()
  const [status, setStatus] = useState<string>(router.params?.status || 'all')
  const [list, setList] = useState<Order[]>([])

  useEffect(() => { loadData() }, [status])

  async function loadData() {
    try {
      const r = await api.order.list({ status: status === 'all' ? undefined : status })
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  const tabs = [
    { k: 'all', t: '全部' },
    { k: 'pending', t: '待付款' },
    { k: 'paid', t: '待接单' },
    { k: 'delivering', t: '配送中' },
    { k: 'done', t: '已完成' },
  ]

  const statusColor: Record<string, string> = {
    pending: '#faad14', paid: '#1890ff', cooking: '#1890ff',
    delivering: '#722ed1', done: '#52c41a', cancelled: '#999'
  }
  const statusText: Record<string, string> = {
    pending: '待付款', paid: '待接单', cooking: '制作中',
    delivering: '配送中', done: '已完成', cancelled: '已取消'
  }

  function onDetail(id: number) { Taro.navigateTo({ url: '/pages/food/order-detail/order-detail?id=' + id }) }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="tab-bar">
        {tabs.map(t => (
          <View key={t.k} className={'tab' + (status === t.k ? ' active' : '')} onClick={() => setStatus(t.k)}>
            <Text>{t.t}</Text>
          </View>
        ))}
      </View>

      {list.map((o: Order) => (
        <View key={o.id} className="order-card" onClick={() => onDetail(o.id)}>
          <View className="order-head">
            <Text className="order-no">订单号: {o.orderNo}</Text>
            <Text className="order-status" style={{ color: statusColor[o.status] || '#333' }}>{statusText[o.status] || '未知'}</Text>
          </View>
          <View className="order-items">
            {o.items.map((it: any, i: number) => (
              <Text key={i} className="order-item-line">{it.name} × {it.qty}   {formatPrice(it.price)}</Text>
            ))}
          </View>
          <View className="order-foot">
            <Text className="order-time">{formatTime(new Date(o.createdAt))}</Text>
            <Text className="order-total">合计 {formatPrice(o.total)}</Text>
          </View>
          <View className="order-actions">
            {o.status === 'pending' && (
              <Button className="mini-btn-primary" onClick={(e) => { e.stopPropagation(); onDetail(o.id) }}><Text>去支付</Text></Button>
            )}
            {o.status === 'delivering' && (
              <Button className="mini-btn-primary" onClick={(e) => { e.stopPropagation(); showToast('确认收货', 'success') }}><Text>确认收货</Text></Button>
            )}
            {o.status === 'done' && (
              <Button className="mini-btn" onClick={(e) => { e.stopPropagation(); showToast('已评价', 'success') }}><Text>评价</Text></Button>
            )}
            <Button className="mini-btn" onClick={(e) => { e.stopPropagation(); onDetail(o.id) }}><Text>详情</Text></Button>
          </View>
        </View>
      ))}

      {list.length === 0 && (
        <View className="empty">
          <Text className="empty-icon">📋</Text>
          <Text className="empty-text">暂无订单</Text>
          <Button className="empty-btn" onClick={() => Taro.switchTab({ url: '/pages/index/index' }).catch(() => Taro.navigateTo({ url: '/pages/food/index/index' }))}>
            <Text>去逛逛</Text>
          </Button>
        </View>
      )}
    </ScrollView>
  )
}
