import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice, formatTime } from '../../../utils'
import './index.scss'

interface OrderItem { name: string; qty: number; price: number }

export default function OrderDetail() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [order, setOrder] = useState<any>(null)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const r = await api.order.detail(id)
      setOrder(r)
    } catch (e) { console.error(e) }
  }

  const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: '待付款', color: '#faad14' },
    paid: { text: '待接单', color: '#1890ff' },
    cooking: { text: '制作中', color: '#1890ff' },
    delivering: { text: '配送中', color: '#722ed1' },
    done: { text: '已完成', color: '#52c41a' },
    cancelled: { text: '已取消', color: '#999' }
  }
  const status = order?.status || 'paid'
  const statusInfo = statusMap[status] || statusMap.paid

  async function cancel() {
    try {
      Taro.showLoading({ title: '处理中' })
      await api.order.cancel(id)
      Taro.hideLoading()
      showToast('已取消', 'success')
      loadData()
    } catch (e) { Taro.hideLoading(); showToast('操作失败', 'error') }
  }

  async function confirm() {
    try {
      Taro.showLoading({ title: '处理中' })
      await api.order.confirm(id)
      Taro.hideLoading()
      showToast('已确认', 'success')
      loadData()
    } catch (e) { Taro.hideLoading(); showToast('操作失败', 'error') }
  }

  async function pay() {
    try {
      Taro.showLoading({ title: '支付中' })
      await api.order.pay(id)
      Taro.hideLoading()
      showToast('支付成功', 'success')
      loadData()
    } catch (e) { Taro.hideLoading(); showToast('支付失败', 'error') }
  }

  const items: OrderItem[] = order?.items || [
    { name: '招牌牛肉面', qty: 1, price: 25 },
    { name: '奶茶(大杯)', qty: 2, price: 15 },
  ]
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="status-card">
        <View className="status-icon" style={{ background: statusInfo.color }}>
          <Text>{status === 'delivering' ? '🛵' : status === 'done' ? '✓' : '📦'}</Text>
        </View>
        <View className="status-info-body">
          <Text className="status-text" style={{ color: statusInfo.color }}>{statusInfo.text}</Text>
          <Text className="status-hint">预计 30 分钟送达</Text>
        </View>
      </View>

      <View className="card">
        <View className="addr-row">
          <Text className="addr-icon">📍</Text>
          <View className="addr-body">
            <Text className="addr-phone">{order?.phone || '13800138000'}</Text>
            <Text className="addr-detail">{order?.address || '学生宿舍 3号楼 202室'}</Text>
          </View>
        </View>
      </View>

      <View className="card">
        <Text className="card-title">🍜 商品明细</Text>
        {items.map((i, idx) => (
          <View key={idx} className="item-row">
            <Text className="item-name">{i.name}</Text>
            <Text className="item-qty">x{i.qty}</Text>
            <Text className="item-price">{formatPrice(i.price)}</Text>
          </View>
        ))}
        <View className="divider" />
        <View className="sub-row"><Text>商品小计</Text><Text>{formatPrice(subtotal)}</Text></View>
        <View className="sub-row"><Text>配送费</Text><Text>{formatPrice(order?.deliveryFee || 3)}</Text></View>
        <View className="sub-row"><Text>优惠</Text><Text style={{ color: '#f5222d' }}>-{formatPrice(order?.discount || 0)}</Text></View>
        <View className="sub-row total-row"><Text>合计</Text><Text style={{ color: '#f5222d', fontWeight: 'bold' }}>{formatPrice(order?.total || subtotal + 3)}</Text></View>
      </View>

      <View className="card">
        <Text className="card-title">📄 订单信息</Text>
        <View className="info-row"><Text className="info-label">订单编号</Text><Text className="info-value">{order?.orderNo || 'OD' + Date.now()}</Text></View>
        <View className="info-row"><Text className="info-label">下单时间</Text><Text className="info-value">{order?.createdAt ? formatTime(new Date(order.createdAt)) : formatTime(new Date())}</Text></View>
        <View className="info-row"><Text className="info-label">支付方式</Text><Text className="info-value">{order?.payMethod === 'alipay' ? '支付宝' : '微信支付'}</Text></View>
        {order?.remark && <View className="info-row"><Text className="info-label">备注</Text><Text className="info-value">{order.remark}</Text></View>}
      </View>

      <View className="action-bar">
        {status === 'pending' && <Button className="btn-outline" onClick={cancel}>取消订单</Button>}
        {status === 'pending' && <Button className="btn-primary" onClick={pay}>去支付</Button>}
        {(status === 'paid' || status === 'cooking') && <Button className="btn-outline" onClick={cancel}>申请取消</Button>}
        {status === 'delivering' && <Button className="btn-primary" onClick={confirm}>确认收货</Button>}
        {status === 'done' && <Button className="btn-primary" onClick={() => Taro.navigateTo({ url: '/pages/food/index/index' })}>再来一单</Button>}
      </View>
    </ScrollView>
  )
}
