import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

interface Community { id: number; name: string; desc: string; members: number; category: string }

export default function CommunityList() {
  const [list, setList] = useState<Community[]>([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const r = await api.community.list()
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onDetail(id: number) { Taro.navigateTo({ url: '/pages/community/detail/detail?id=' + id }) }
  function onActivity() { Taro.navigateTo({ url: '/pages/community/activity/activity' }) }
  function onCreate() { Taro.navigateTo({ url: '/pages/community/create/create' }) }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">🎯 兴趣社区</Text>
        <Text className="hero-sub">找到你的同好，一起交流成长</Text>
      </View>

      <View className="quick-row">
        <View className="quick-item" onClick={onCreate}>
          <Text className="quick-icon">✍️</Text>
          <Text className="quick-text">创建社区</Text>
        </View>
        <View className="quick-item" onClick={onActivity}>
          <Text className="quick-icon">🎉</Text>
          <Text className="quick-text">社区活动</Text>
        </View>
        <View className="quick-item" onClick={() => Taro.navigateTo({ url: '/pages/forum/list/list' })}>
          <Text className="quick-icon">💬</Text>
          <Text className="quick-text">校园论坛</Text>
        </View>
        <View className="quick-item" onClick={() => Taro.navigateTo({ url: '/pages/confession/list/list' })}>
          <Text className="quick-icon">💌</Text>
          <Text className="quick-text">表白墙</Text>
        </View>
      </View>

      {list.map((c: Community) => (
        <View key={c.id} className="comm-card" onClick={() => onDetail(c.id)}>
          <View className="comm-logo">🎨</View>
          <View className="comm-body">
            <Text className="comm-name">{c.name}</Text>
            <Text className="comm-desc">{c.desc}</Text>
            <View className="comm-meta">
              <Text className="comm-cat">{c.category}</Text>
              <Text className="comm-members">{c.members || 0} 位成员</Text>
            </View>
          </View>
          <Button className="join-btn"><Text>加入</Text></Button>
        </View>
      ))}

      {list.length === 0 && <View className="empty"><Text>暂无社区，快来创建第一个</Text></View>}
    </ScrollView>
  )
}
