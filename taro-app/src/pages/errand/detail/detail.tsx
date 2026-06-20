import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice, formatTime } from '../../../utils'
import './index.scss'

export default function ErrandDetail() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const d = await api.errand.detail(id)
      setDetail(d)
    } catch (e) { console.error(e) }
  }

  async function accept() {
    try {
      Taro.showLoading({ title: '接单中' })
      await api.errand.accept(id)
      Taro.hideLoading()
      showToast('接单成功', 'success')
      if (detail) setDetail({ ...detail, status: 'taken' })
    } catch (e) { Taro.hideLoading(); showToast('操作失败', 'error') }
  }

  async function complete() {
    try {
      Taro.showLoading({ title: '处理中' })
      await api.errand.complete(id)
      Taro.hideLoading()
      showToast('已完成', 'success')
      if (detail) setDetail({ ...detail, status: 'done' })
    } catch (e) { Taro.hideLoading(); showToast('操作失败', 'error') }
  }

  const statusColor: Record<string, string> = { pending: '#fa8c16', taken: '#1890ff', done: '#52c41a', cancelled: '#999' }
  const statusText: Record<string, string> = { pending: '可接单', taken: '进行中', done: '已完成', cancelled: '已取消' }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="reward">报酬</Text>
        <Text className="price">{formatPrice(detail?.price || 0)}</Text>
        <View className="status-row">
          <Text className="status" style={{ background: statusColor[detail?.status] || '#999' }}>
            {statusText[detail?.status] || '可接单'}
          </Text>
        </View>
      </View>

      <View className="card">
        <Text className="title">{detail?.title || '任务标题'}</Text>
        <Text className="type">{detail?.type || '其他'}</Text>
        <Text className="desc">{detail?.desc || '任务描述'}</Text>
      </View>

      <View className="card">
        <Text className="card-title">📍 任务详情</Text>
        <View className="info-row"><Text className="info-label">取件地址</Text><Text className="info-value">{detail?.pickup || '校内菜鸟驿站'}</Text></View>
        <View className="info-row"><Text className="info-label">送达地址</Text><Text className="info-value">{detail?.delivery || '3号宿舍楼'}</Text></View>
        <View className="info-row"><Text className="info-label">期望时间</Text><Text className="info-value">{detail?.expectedTime ? formatTime(new Date(detail.expectedTime)) : '今日 18:00 前'}</Text></View>
        <View className="info-row"><Text className="info-label">联系电话</Text><Text className="info-value">{detail?.phone || '13800138000'}</Text></View>
      </View>

      <View className="card">
        <Text className="card-title">👤 发布人</Text>
        <View className="publisher">
          <View className="avatar">{(detail?.publisher || 'P')[0]}</View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text className="publisher-name">{detail?.publisher || '匿名用户'}</Text>
            <Text className="publisher-meta">发布于 {formatTime(new Date(detail?.createdAt || Date.now()))}</Text>
          </View>
        </View>
      </View>

      <View className="action-bar">
        {detail?.status !== 'taken' && detail?.status !== 'done' && (
          <Button className="accept-btn" onClick={accept}><Text>立即接单</Text></Button>
        )}
        {detail?.status === 'taken' && (
          <Button className="accept-btn" onClick={complete}><Text>完成任务</Text></Button>
        )}
        {detail?.status === 'done' && (
          <Button className="done-btn" disabled><Text>任务已完成 ✓</Text></Button>
        )}
      </View>
    </ScrollView>
  )
}
