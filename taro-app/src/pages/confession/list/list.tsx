import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { timeAgo } from '../../../utils'
import './index.scss'

interface Item { id: number; title: string; content: string; anonymous: boolean; author: string; likes: number; comments: number; createdAt: number; gender: string }

export default function ConfessionList() {
  const [list, setList] = useState<Item[]>([])
  const [tab, setTab] = useState('all')

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    try {
      const r = await api.confession.list({ gender: tab === 'all' ? undefined : tab })
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onDetail(id: number) { Taro.navigateTo({ url: '/pages/confession/detail/detail?id=' + id }) }
  function onPublish() { Taro.navigateTo({ url: '/pages/confession/publish/publish' }) }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">💌 表白墙</Text>
        <Text className="hero-sub">说出心里话，邂逅心动瞬间</Text>
      </View>

      <View className="tab-row">
        {[{ k: 'all', t: '全部' }, { k: '男', t: '男生' }, { k: '女', t: '女生' }].map(x => (
          <View key={x.k} className={'tab' + (tab === x.k ? ' active' : '')} onClick={() => setTab(x.k)}>
            <Text>{x.t}</Text>
          </View>
        ))}
      </View>

      {list.map((item: Item) => (
        <View key={item.id} className="card" onClick={() => onDetail(item.id)}>
          <View className="head">
            <View className="avatar">{item.anonymous ? '?' : (item.author || 'A')[0]}</View>
            <View className="head-body">
              <Text className="author">{item.anonymous ? '匿名用户' : item.author}</Text>
              <Text className="time">{timeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <Text className="title">{item.title}</Text>
          <Text className="content">{item.content}</Text>
          <View className="foot">
            <Text className="like">👍 {item.likes}</Text>
            <Text className="comment">💬 {item.comments}</Text>
          </View>
        </View>
      ))}

      {list.length === 0 && <View className="empty"><Text className="empty-icon">💌</Text><Text>还没有表白，快来第一条</Text></View>}

      <View className="fab" onClick={onPublish}>
        <Text style={{ color: '#fff', fontSize: 44 }}>+</Text>
      </View>
    </ScrollView>
  )
}
