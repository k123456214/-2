import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatTime } from '../../../utils'
import './index.scss'

interface Comment { id: number; author: string; content: string; createdAt: number }

export default function ConfessionDetail() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [detail, setDetail] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [reply, setReply] = useState('')
  const [liked, setLiked] = useState(false)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const d = await api.confession.detail(id)
      setDetail(d)
      setComments((d as any).comments || [])
    } catch (e) { console.error(e) }
  }

  async function like() {
    try {
      await api.confession.like(id)
      setLiked(true)
      setDetail({ ...detail, likes: (detail?.likes || 0) + 1 })
      showToast('已点赞', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  async function send() {
    if (!reply.trim()) return
    try {
      await api.confession.comment(id, { content: reply })
      setComments([{ id: Date.now(), author: '我', content: reply, createdAt: Date.now() }, ...comments])
      setReply('')
      showToast('评论成功', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="card">
        <View className="head">
          <View className="avatar">{detail?.anonymous ? '?' : (detail?.author || 'A')[0]}</View>
          <View className="head-body">
            <Text className="author">{detail?.anonymous ? '匿名用户' : detail?.author}</Text>
            <Text className="time">{formatTime(new Date(detail?.createdAt || Date.now()))}</Text>
          </View>
        </View>
        <Text className="title">{detail?.title || '致那个ta'}</Text>
        <Text className="content">{detail?.content || '内容...'}</Text>
        <View className="like-row" onClick={like}>
          <Text className="like-icon">{liked ? '❤️' : '🤍'}</Text>
          <Text className="like-num">{(detail?.likes || 0) + (liked ? 1 : 0)}</Text>
        </View>
      </View>

      <View className="comments">
        <Text className="comment-title">评论 {comments.length}</Text>
        {comments.map(c => (
          <View key={c.id} className="comment">
            <Text className="comment-author">{c.author}</Text>
            <Text className="comment-content">{c.content}</Text>
            <Text className="comment-time">{formatTime(new Date(c.createdAt))}</Text>
          </View>
        ))}
        {comments.length === 0 && <View className="empty-mini"><Text>还没有评论，抢沙发</Text></View>}
      </View>

      <View className="reply-bar">
        <Input className="reply-input" placeholder="写下评论..." value={reply} onInput={(e: any) => setReply(e.detail.value)} />
        <Button className="reply-btn" onClick={send}><Text>发送</Text></Button>
      </View>
    </ScrollView>
  )
}
