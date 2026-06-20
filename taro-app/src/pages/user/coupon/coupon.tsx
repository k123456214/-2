import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface Coupon { id: number; name: string; type: string; discount: number; minOrder: number; expireAt: number; used: boolean }

export default function Coupon() {
  const [tab, setTab] = useState<'available' | 'used' | 'expired'>('available')
  const [list, setList] = useState<Coupon[]>([])

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    try {
      const r = await api.coupon.myCoupons()
      const data = (r as any).list || r || []
      setList(data)
    } catch (e) { console.error(e) }
  }

  async function receiveDemo() {
    try {
      Taro.showLoading({ title: '领取中' })
      await api.coupon.receive(1)
      Taro.hideLoading()
      showToast('领取成功', 'success')
      loadData()
    } catch (e) { Taro.hideLoading(); showToast('领取失败', 'error') }
  }

  const tabs = [{ k: 'available', t: '可使用' }, { k: 'used', t: '已使用' }, { k: 'expired', t: '已过期' }]

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="tab-bar">
        {tabs.map(t => (
          <View key={t.k} className={'tab' + (tab === t.k ? ' active' : '')} onClick={() => setTab(t.k as any)}>
            <Text>{t.t}</Text>
          </View>
        ))}
      </View>

      {list.map((c: Coupon) => (
        <View key={c.id} className={'coupon-card' + (c.used ? ' used' : '')}>
          <View className="coupon-left">
            <Text className="coupon-symbol">¥</Text>
            <Text className="coupon-value">{c.discount}</Text>
            <Text className="coupon-condition">满{formatPrice(c.minOrder)}可用</Text>
          </View>
          <View className="coupon-right">
            <Text className="coupon-name">{c.name}</Text>
            <Text className="coupon-type">{c.type || '通用'}</Text>
            <Text className="coupon-expire">有效期至 {new Date(c.expireAt || Date.now() + 86400000 * 30).toLocaleDateString()}</Text>
            {!c.used && tab === 'available' && (
              <Button className="use-btn" onClick={() => Taro.navigateTo({ url: '/pages/food/index/index' })}>
                <Text>立即使用</Text>
              </Button>
            )}
          </View>
        </View>
      ))}

      {list.length === 0 && (
        <View className="empty">
          <Text className="empty-icon">🎫</Text>
          <Text className="empty-text">暂无优惠券</Text>
          <Button className="demo-btn" onClick={receiveDemo}><Text>领取一张</Text></Button>
        </View>
      )}
    </ScrollView>
  )
}
