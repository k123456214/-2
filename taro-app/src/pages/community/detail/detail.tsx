import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, timeAgo } from '../../../utils'
import './index.scss'

interface Post { id: number; title: string; author: string; likes: number; comments: number; createdAt: number }

export default function CommunityDetail() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [detail, setDetail] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [joined, setJoined] = useState(false)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const [d, p] = await Promise.all([api.community.detail(id), api.community.posts(id)])
      setDetail(d)
      setPosts((p as any).list || p || [])
    } catch (e) { console.error(e) }
  }

  async function join() {
    try {
      await api.community.join(id)
      setJoined(true)
      showToast('已加入', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <View className="hero-icon">🎨</View>
        <Text className="hero-title">{detail?.name || '兴趣社区'}</Text>
        <Text className="hero-sub">{detail?.desc || '一群志趣相投的伙伴'}</Text>
        <View className="hero-stats">
          <View className="stat"><Text className="stat-num">{detail?.members || 100}</Text><Text className="stat-label">成员</Text></View>
          <View className="stat"><Text className="stat-num">{posts.length}</Text><Text className="stat-label">帖子</Text></View>
          <View className="stat"><Text className="stat-num">⭐</Text><Text className="stat-label">精选</Text></View>
        </View>
      </View>

      <View className="actions">
        <Button className={'join-btn' + (joined ? ' joined' : '')} onClick={join}>
          <Text>{joined ? '✓ 已加入' : '+ 加入社区'}</Text>
        </Button>
      </View>

      <View className="card">
        <Text className="card-title">🔥 社区动态</Text>
        {posts.map((p: Post) => (
          <View key={p.id} className="post-item" onClick={() => Taro.navigateTo({ url: '/pages/forum/detail/detail?id=' + p.id })}>
            <Text className="post-title">{p.title}</Text>
            <View className="post-meta">
              <Text className="post-author">{p.author}</Text>
              <Text className="post-time">{timeAgo(p.createdAt || Date.now())}</Text>
              <Text className="post-like">👍 {p.likes}</Text>
              <Text className="post-comment">💬 {p.comments}</Text>
            </View>
          </View>
        ))}
        {posts.length === 0 && <View className="empty"><Text>暂无动态，快来发布第一篇</Text></View>}
      </View>
    </ScrollView>
  )
}
