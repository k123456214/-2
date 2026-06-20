import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice, timeAgo } from '../../../utils'
import './index.scss'

interface Task { id: number; title: string; type: string; desc: string; price: number; publisher: string; location: string; createdAt: number; status: string }

export default function ErrandList() {
  const [list, setList] = useState<Task[]>([])
  const [tab, setTab] = useState('all')

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    try {
      const r = await api.errand.list({ status: tab === 'all' ? undefined : tab })
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onDetail(id: number) { Taro.navigateTo({ url: '/pages/errand/detail/detail?id=' + id }) }
  function onPublish() { Taro.navigateTo({ url: '/pages/errand/publish/publish' }) }

  const typeIcon: Record<string, string> = { 取快递: '📦', 代购: '🛒', 代打印: '🖨', 其他: '🏃' }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">🏃 校园跑腿</Text>
        <Text className="hero-sub">下单有人接，帮你省时间</Text>
      </View>

      <View className="tab-bar">
        {[{ k: 'all', t: '全部' }, { k: 'pending', t: '可接' }, { k: 'taken', t: '进行中' }, { k: 'done', t: '已完成' }].map(x => (
          <View key={x.k} className={'tab' + (tab === x.k ? ' active' : '')} onClick={() => setTab(x.k)}>
            <Text>{x.t}</Text>
          </View>
        ))}
      </View>

      {list.map((t: Task) => (
        <View key={t.id} className="task-card" onClick={() => onDetail(t.id)}>
          <View className="task-head">
            <Text className="task-icon">{typeIcon[t.type] || '🏃'}</Text>
            <View className="task-head-body">
              <Text className="task-title">{t.title}</Text>
              <Text className="task-type">{t.type}</Text>
            </View>
            <Text className="task-price">{formatPrice(t.price)}</Text>
          </View>
          <Text className="task-desc">{t.desc}</Text>
          <View className="task-foot">
            <Text className="task-publisher">发布人: {t.publisher}</Text>
            <Text className="task-time">{timeAgo(t.createdAt)}</Text>
          </View>
        </View>
      ))}

      {list.length === 0 && <View className="empty"><Text className="empty-icon">🏃</Text><Text>暂无跑腿任务</Text></View>}

      <View className="fab" onClick={onPublish}>
        <Text style={{ color: '#fff', fontSize: 44 }}>+</Text>
      </View>
    </ScrollView>
  )
}
