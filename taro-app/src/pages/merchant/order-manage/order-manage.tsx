import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice, formatTime } from '../../../utils'
import './index.scss'

interface Order { id: number; orderNo: string; status: string; total: number; createdAt: number; items: { name: string; qty: number }[] }

export default function OrderManage() {
  const [tab, setTab] = useState('all')
  const [list, setList] = useState<Order[]>([])

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    try {
      const r = await api.order.list({ status: tab === 'all' ? undefined : tab })
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function statusText(s: string) {
    return ({ pending: '待付款', paid: '待接单', cooking: '制作中', delivering: '配送中', done: '已完成', cancelled: '已取消' } as any)[s] || s
  }

  function statusColor(s: string) {
    return ({ pending: '#faad14', paid: '#1890ff', cooking: '#1890ff', delivering: '#722ed1', done: '#52c41a', cancelled: '#999' } as any)[s] || '#999'
  }

  async function action(order: Order, next: string) {
    try {
      Taro.showLoading({ title: '处理中' })
      if (next === 'cancel') await api.order.cancel(order.id)
      else if (next === 'confirm') await api.order.confirm(order.id)
      else if (next === 'pay') await api.order.pay(order.id)
      Taro.hideLoading()
      showToast('操作成功', 'success')
      loadData()
    } catch (e) { Taro.hideLoading(); showToast('操作失败', 'error') }
  }

  const tabs = [{ k: 'all', name: '全部' }, { k: 'paid', name: '待接单' }, { k: 'cooking', name: '制作中' }, { k: 'delivering', name: '配送中' }, { k: 'done', name: '已完成' }]

  return (
    <ScrollView scrollY className="page-scroll">
      <ScrollView scrollX className="tab-bar">
        {tabs.map(t => (
          <View key={t.k} className={'tab-item' + (tab === t.k ? ' active' : '')} onClick={() => setTab(t.k)}>
            <Text>{t.name}</Text>
          </View>
        ))}
      </ScrollView>

      {list.map((o: Order) => (
        <View key={o.id} className="order-card">
          <View className="order-head">
            <Text className="order-no">#{o.orderNo}</Text>
            <Text className="order-status" style={{ color: statusColor(o.status) }}>{statusText(o.status)}</Text>
          </View>
          <View className="order-items">
            {o.items.map((it, i) => (
              <Text key={i} className="order-item-line">{it.name} x{it.qty}</Text>
            ))}
          </View>
          <View className="order-foot">
            <Text className="order-time">{formatTime(new Date(o.createdAt || Date.now()))}</Text>
            <Text className="order-total">合计 {formatPrice(o.total)}</Text>
          </View>
          <View className="order-actions">
            {o.status === 'paid' && <Button className="mini-btn" onClick={() => action(o, 'cooking')}><Text>开始制作</Text></Button>}
            {o.status === 'cooking' && <Button className="mini-btn" onClick={() => action(o, 'delivering')}><Text>出餐配送</Text></Button>}
            {o.status === 'delivering' && <Button className="mini-btn-primary" onClick={() => action(o, 'confirm')}><Text>确认送达</Text></Button>}
            {(o.status === 'paid' || o.status === 'cooking') && <Button className="mini-btn-danger" onClick={() => action(o, 'cancel')}><Text>取消订单</Text></Button>}
            <Button className="mini-btn" onClick={() => Taro.navigateTo({ url: '/pages/food/order-detail/order-detail?id=' + o.id })}><Text>详情</Text></Button>
          </View>
        </View>
      ))}

      {list.length === 0 && <View className="empty"><Text className="empty-icon">📋</Text><Text>暂无订单</Text></View>}
    </ScrollView>
  )
}
