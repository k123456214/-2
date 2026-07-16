import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [levelInfo, setLevelInfo] = useState<any>({ level: 1, name: '新生', points: 128, nextLevel: 500 })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [u, lv] = await Promise.all([api.user.profile(), api.user.levelInfo()])
      setUser(u)
      if (lv) setLevelInfo(lv)
    } catch (e) {
      console.error(e)
      // 默认值
      setUser({ id: 1, nickname: '同学', avatar: '', phone: '138****0000', balance: 0, coupons: 0 })
    }
  }

  const menus = [
    { icon: '📋', name: '我的订单', url: '/pages/user/order/my-order' },
    { icon: '🎫', name: '优惠券', url: '/pages/user/coupon/coupon' },
    { icon: '❤️', name: '我的收藏', url: '/pages/user/favorite/favorite' },
    { icon: '🏪', name: '我的店铺', url: '/pages/merchant/my-shop/my-shop' },
    { icon: '📦', name: '发布的商品', url: '/pages/market/my-goods/my-goods' },
    { icon: '⚙️', name: '设置', url: '/pages/user/settings/settings' },
  ]

  const orderTabs = [
    { icon: '💳', name: '待付款', key: 'pending' },
    { icon: '📦', name: '待发货', key: 'paid' },
    { icon: '🚚', name: '配送中', key: 'delivering' },
    { icon: '✅', name: '已完成', key: 'done' },
  ]

  const progress = Math.min(100, Math.floor((levelInfo.points / levelInfo.nextLevel) * 100))

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <View className="user-row">
          <View className="avatar">{(user?.nickname || 'U')[0]}</View>
          <View className="user-info">
            <Text className="nickname">{user?.nickname || '同学'}</Text>
            <Text className="user-meta">ID: {user?.id || 1} · {user?.phone || '未绑定'}</Text>
          </View>
          <Button className="edit-btn" onClick={() => Taro.navigateTo({ url: '/pages/user/settings/settings' })}>
            <Text>编辑</Text>
          </Button>
        </View>

        <View className="level-card">
          <View className="level-head">
            <Text className="level-label">Lv.{levelInfo.level} {levelInfo.name}</Text>
            <Text className="level-points">{levelInfo.points} / {levelInfo.nextLevel} 积分</Text>
          </View>
          <View className="level-bar">
            <View className="level-bar-fill" style={{ width: progress + '%' }} />
          </View>
        </View>

        <View className="stat-row">
          <View className="stat-item"><Text className="stat-num">{formatPrice(user?.balance || 0)}</Text><Text className="stat-label">余额</Text></View>
          <View className="stat-item"><Text className="stat-num">{user?.coupons || 0}</Text><Text className="stat-label">优惠券</Text></View>
          <View className="stat-item"><Text className="stat-num">{levelInfo.points}</Text><Text className="stat-label">积分</Text></View>
        </View>
      </View>

      <View className="order-card">
        <View className="order-head">
          <Text className="order-title">📋 我的订单</Text>
          <Text className="order-more" onClick={() => Taro.navigateTo({ url: '/pages/user/order/my-order' })}>全部订单 ›</Text>
        </View>
        <View className="order-tabs">
          {orderTabs.map((t, i) => (
            <View key={i} className="order-tab" onClick={() => Taro.navigateTo({ url: '/pages/user/order/my-order?status=' + t.key })}>
              <Text className="order-tab-icon">{t.icon}</Text>
              <Text className="order-tab-name">{t.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="menu-card">
        {menus.map((m, i) => (
          <View key={i} className="menu-item" onClick={() => Taro.navigateTo({ url: m.url })}>
            <Text className="menu-icon">{m.icon}</Text>
            <Text className="menu-name">{m.name}</Text>
            <Text className="menu-arrow">›</Text>
          </View>
        ))}
      </View>

      <View className="logout-row">
        <Button className="logout-btn" onClick={() => {
          Taro.showModal({
            title: '提示',
            content: '确定退出登录?',
            success: (res) => { if (res.confirm) { Taro.removeStorageSync('user_token'); Taro.redirectTo({ url: '/pages/user/login/login' }) } }
          })
        }}>
          <Text>退出登录</Text>
        </Button>
      </View>
    </ScrollView>
  )
}
