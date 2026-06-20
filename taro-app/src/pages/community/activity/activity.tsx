import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatTime } from '../../../utils'
import './index.scss'

interface Activity { id: number; title: string; location: string; startTime: number; joined: number; limit: number; desc: string }

export default function Activity() {
  const [list, setList] = useState<Activity[]>([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const r = await api.community.activities()
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function join(a: Activity) {
    showToast('已报名 ' + a.title, 'success')
    setList(prev => prev.map(x => x.id === a.id ? { ...x, joined: x.joined + 1 } : x))
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">🎉 社区活动</Text>
        <Text className="hero-sub">精彩活动，与同好相聚</Text>
      </View>

      {list.map((a: Activity) => (
        <View key={a.id} className="act-card">
          <Text className="act-title">{a.title}</Text>
          <Text className="act-desc">{a.desc}</Text>
          <View className="act-info">
            <Text className="act-line">📍 {a.location}</Text>
            <Text className="act-line">🕐 {formatTime(new Date(a.startTime || Date.now()))}</Text>
            <Text className="act-line">👥 {a.joined}/{a.limit} 人已报名</Text>
          </View>
          <Button className="act-btn" onClick={() => join(a)}><Text>立即报名</Text></Button>
        </View>
      ))}

      {list.length === 0 && <View className="empty"><Text className="empty-icon">🎉</Text><Text>暂无活动，敬请期待</Text></View>}
    </ScrollView>
  )
}
