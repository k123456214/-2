import { useEffect, useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea, Switch, Form } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface CartItem { key: string; goodsId: number; name: string; qty: number; price: number }

export default function Checkout() {
  const [items, setItems] = useState<CartItem[]>([])
  const [shopId, setShopId] = useState<number>(1)
  const [address, setAddress] = useState('学生宿舍 3号楼 202室')
  const [phone, setPhone] = useState('13800138000')
  const [remark, setRemark] = useState('')
  const [useCoupon, setUseCoupon] = useState(false)
  const [coupon, setCoupon] = useState<any>(null)
  const [payMethod, setPayMethod] = useState('wechat')

  useEffect(() => {
    try {
      const its = Taro.getStorageSync('checkout_items') as CartItem[] || []
      const sid = Taro.getStorageSync('checkout_shop') as number || 1
      setItems(its)
      setShopId(sid)
    } catch (e) { console.error(e) }
    loadCoupon()
  }, [])

  async function loadCoupon() {
    try {
      const r = await api.coupon.myCoupons()
      const list = (r as any).list || r || []
      if (list[0]) setCoupon(list[0])
    } catch (e) { console.error(e) }
  }

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  const deliveryFee = 3
  const discount = useCoupon && coupon ? (coupon.discount || 5) : 0
  const total = Math.max(0, subtotal + deliveryFee - discount)

  async function submit() {
    if (!address || !phone) { showToast('请完善收货信息'); return }
    if (items.length === 0) { showToast('购物车为空'); return }
    try {
      Taro.showLoading({ title: '下单中...', mask: true })
      const r = await api.order.create({
        merchantId: shopId,
        items,
        address, phone, remark,
        useCoupon: useCoupon ? coupon?.id : null,
        payMethod,
        total
      })
      Taro.hideLoading()
      showToast('下单成功', 'success')
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/food/order-detail/order-detail?id=' + ((r as any).id || 1) })
      }, 1200)
    } catch (e) {
      Taro.hideLoading()
      showToast('下单失败', 'error')
    }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="card address-card">
        <View className="addr-icon"><Text>📍</Text></View>
        <View className="addr-body">
          <Text className="addr-phone">{phone}</Text>
          <Text className="addr-detail">{address}</Text>
          <View className="addr-edit">
            <Text>✏️ 点击修改地址</Text>
          </View>
        </View>
      </View>

      <View className="card">
        <View className="card-title-row">
          <Text className="card-title">🍜 商品清单</Text>
        </View>
        {items.map(i => (
          <View key={i.key} className="order-item">
            <View className="order-item-name"><Text>{i.name}</Text></View>
            <View className="order-item-right">
              <Text className="order-item-qty">x{i.qty}</Text>
              <Text className="order-item-price">{formatPrice(i.price * i.qty)}</Text>
            </View>
          </View>
        ))}
        <View className="divider" />
        <View className="row"><Text className="row-label">商品小计</Text><Text className="row-value">{formatPrice(subtotal)}</Text></View>
        <View className="row"><Text className="row-label">配送费</Text><Text className="row-value">{formatPrice(deliveryFee)}</Text></View>
        <View className="row">
          <View className="row-label-flex">
            <Text>优惠券</Text>
            <Switch checked={useCoupon} onChange={(e: any) => setUseCoupon(e.detail.value)} color="#1890ff" />
          </View>
          <Text className="row-value discount">-{formatPrice(discount)}</Text>
        </View>
      </View>

      <View className="card">
        <Text className="card-title">📝 订单备注</Text>
        <Textarea
          className="remark-input"
          placeholder="口味偏好、送达时间等..."
          value={remark}
          onInput={(e: any) => setRemark(e.detail.value)}
          maxlength={100}
        />
      </View>

      <View className="card">
        <Text className="card-title">💳 支付方式</Text>
        {[
          { id: 'wechat', name: '微信支付', icon: '💚' },
          { id: 'alipay', name: '支付宝', icon: '💙' },
          { id: 'balance', name: '余额支付', icon: '💰' },
        ].map(p => (
          <View key={p.id} className="pay-item" onClick={() => setPayMethod(p.id)}>
            <Text className="pay-icon">{p.icon}</Text>
            <Text className="pay-name">{p.name}</Text>
            <View className={'radio' + (payMethod === p.id ? ' radio-active' : '')}>
              {payMethod === p.id && <Text>✓</Text>}
            </View>
          </View>
        ))}
      </View>

      <View className="total-bar">
        <View className="total-left">
          <Text className="total-label">合计：</Text>
          <Text className="total-value">{formatPrice(total)}</Text>
        </View>
        <Button className="pay-btn" onClick={submit}>
          <Text>提交订单</Text>
        </Button>
      </View>
    </ScrollView>
  )
}
