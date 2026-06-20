import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface FavoriteItem { id: number; type: 'goods' | 'shop' | 'post'; name: string; price?: number; icon: string }

export default function Favorite() {
  const [tab, setTab] = useState<'goods' | 'shop' | 'post'>('goods')
  const [list, setList] = useState<FavoriteItem[]>([])

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    try {
      // 使用 mock 数据
      const mock = {
        goods: [
          { id: 1, type: 'goods' as const, name: '九成新 iPad 2023', price: 1999, icon: '📱' },
          { id: 2, type: 'goods' as const, name: '数学教材 第7版', price: 25, icon: '📚' },
          { id: 3, type: 'goods' as const, name: '罗技无线鼠标', price: 99, icon: '🖱' },
        ],
        shop: [
          { id: 1, type: 'shop' as const, name: '校园快餐店', icon: '🍔' },
          { id: 2, type: 'shop' as const, name: '奶茶小屋', icon: '🧋' },
        ],
        post: [
          { id: 1, type: 'post' as const, name: '考研经验分享', icon: '📝' },
          { id: 2, type: 'post' as const, name: '校园生活小贴士', icon: '💡' },
          { id: 3, type: 'post' as const, name: '表白我的室友', icon: '💌' },
        ],
      }
      setList(mock[tab])
    } catch (e) { console.error(e) }
  }

  function remove(id: number) {
    Taro.showModal({
      title: '提示',
      content: '确定取消收藏?',
      success: (res) => {
        if (res.confirm) {
          setList(prev => prev.filter(x => x.id !== id))
          showToast('已取消收藏', 'success')
        }
      }
    })
  }

  const tabs = [{ k: 'goods', t: '商品' }, { k: 'shop', t: '商户' }, { k: 'post', t: '帖子' }]

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="tab-bar">
        {tabs.map(t => (
          <View key={t.k} className={'tab' + (tab === t.k ? ' active' : '')} onClick={() => setTab(t.k as any)}>
            <Text>{t.t}</Text>
          </View>
        ))}
      </View>

      {list.map((item: FavoriteItem) => (
        <View key={item.id} className="item-card">
          <View className="item-icon">{item.icon}</View>
          <View className="item-body">
            <Text className="item-name">{item.name}</Text>
            {item.price && <Text className="item-price">{formatPrice(item.price)}</Text>}
          </View>
          <Button className="remove-btn" onClick={() => remove(item.id)}><Text>取消收藏</Text></Button>
        </View>
      ))}

      {list.length === 0 && (
        <View className="empty">
          <Text className="empty-icon">❤️</Text>
          <Text className="empty-text">暂无收藏</Text>
        </View>
      )}
    </ScrollView>
  )
}
