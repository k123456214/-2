import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { timeAgo } from '../../../utils'
import './index.scss'

interface Post { id: number; title: string; content: string; author: string; likes: number; comments: number; createdAt: number; category: string }

export default function ForumList() {
  const [list, setList] = useState<Post[]>([])
  const [keyword, setKeyword] = useState('')
  const [cat, setCat] = useState('全部')
  const cats = ['全部', '校园', '学习', '生活', '吐槽', '求助', '分享']

  useEffect(() => { loadData() }, [cat])

  async function loadData() {
    try {
      const r = await api.forum.list({ category: cat === '全部' ? undefined : cat })
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  function onDetail(id: number) { Taro.navigateTo({ url: '/pages/forum/detail/detail?id=' + id }) }
  function onPublish() { Taro.navigateTo({ url: '/pages/forum/publish/publish' }) }

  const filtered = list.filter(p => !keyword || p.title.includes(keyword) || p.content.includes(keyword))

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">📚 校园论坛</Text>
        <Text className="hero-sub">畅所欲言，分享校园点滴</Text>
        <View className="search-bar">
          <Text className="search-icon">🔍</Text>
          <Input className="search-input" placeholder="搜索帖子..." value={keyword} onInput={(e: any) => setKeyword(e.detail.value)} confirmType="search" />
        </View>
      </View>

      <ScrollView scrollX className="cat-bar">
        {cats.map(c => (
          <View key={c} className={'cat-item' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>
            <Text>{c}</Text>
          </View>
        ))}
      </ScrollView>

      {filtered.map((p: Post) => (
        <View key={p.id} className="post-card" onClick={() => onDetail(p.id)}>
          <Text className="post-title">{p.title}</Text>
          <Text className="post-content">{p.content}</Text>
          <View className="post-foot">
            <Text className="post-cat">{p.category}</Text>
            <Text className="post-author">{p.author}</Text>
            <Text className="post-time">{timeAgo(p.createdAt || Date.now())}</Text>
            <Text className="post-stat">👍 {p.likes}</Text>
            <Text className="post-stat">💬 {p.comments}</Text>
          </View>
        </View>
      ))}

      {filtered.length === 0 && <View className="empty"><Text className="empty-icon">📝</Text><Text>暂无帖子</Text></View>}

      <View className="fab" onClick={onPublish}>
        <Text style={{ color: '#fff', fontSize: 44 }}>+</Text>
      </View>
    </ScrollView>
  )
}
