import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatTime } from '../../../utils'
import './index.scss'

interface Comment { id: number; author: string; content: string; createdAt: number; likes: number }

export default function ForumDetail() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [detail, setDetail] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [fav, setFav] = useState(false)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const d = await api.forum.detail(id)
      setDetail(d)
      setComments((d as any).comments || [])
    } catch (e) { console.error(e) }
  }

  async function like() {
    try {
      await api.forum.like(id)
      setLiked(true)
      setDetail({ ...detail, likes: (detail?.likes || 0) + 1 })
      showToast('已点赞', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  async function favorite() {
    try {
      await api.forum.favorite(id)
      setFav(true)
      showToast('已收藏', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  async function sendComment() {
    if (!newComment.trim()) return
    try {
      await api.forum.reply(id, { content: newComment })
      setComments([{ id: Date.now(), author: '我', content: newComment, createdAt: Date.now(), likes: 0 }, ...comments])
      setNewComment('')
      showToast('评论成功', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="content-card">
        <Text className="title">{detail?.title || '帖子标题'}</Text>
        <View className="meta">
          <Text className="author">{detail?.author || '匿名用户'}</Text>
          <Text className="time">{formatTime(new Date(detail?.createdAt || Date.now()))}</Text>
        </View>
        <Text className="content">{detail?.content || '这是帖子内容。'}</Text>
      </View>

      <View className="action-card">
        <View className="act" onClick={like}>
          <Text className="act-icon">{liked ? '👍' : '👍'}</Text>
          <Text className="act-num">{(detail?.likes || 0) + (liked ? 1 : 0)}</Text>
        </View>
        <View className="act" onClick={favorite}>
          <Text className="act-icon">{fav ? '⭐' : '☆'}</Text>
          <Text className="act-num">收藏</Text>
        </View>
        <View className="act">
          <Text className="act-icon">💬</Text>
          <Text className="act-num">{comments.length}</Text>
        </View>
      </View>

      <View className="comment-card">
        <Text className="comment-title">评论 {comments.length}</Text>
        {comments.map((c: Comment) => (
          <View key={c.id} className="comment-item">
            <View className="avatar">{(c.author || 'A')[0]}</View>
            <View className="comment-body">
              <Text className="comment-author">{c.author}</Text>
              <Text className="comment-content">{c.content}</Text>
              <Text className="comment-time">{formatTime(new Date(c.createdAt))}</Text>
            </View>
          </View>
        ))}
        {comments.length === 0 && <View className="empty-mini"><Text>暂无评论，快来说两句</Text></View>}
      </View>

      <View className="reply-bar">
        <Input className="reply-input" placeholder="写评论..." value={newComment} onInput={(e: any) => setNewComment(e.detail.value)} />
        <Button className="reply-btn" onClick={sendComment}><Text>发送</Text></Button>
      </View>
    </ScrollView>
  )
}
