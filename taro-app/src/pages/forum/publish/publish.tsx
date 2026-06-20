import { useState } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function ForumPublish() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('校园')
  const cats = ['校园', '学习', '生活', '吐槽', '求助', '分享']

  async function submit() {
    if (!title || !content) { showToast('请填写完整'); return }
    try {
      Taro.showLoading({ title: '发布中', mask: true })
      await api.forum.create({ title, content, category })
      Taro.hideLoading()
      showToast('发布成功', 'success')
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (e) { Taro.hideLoading(); showToast('发布失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="card">
        <Text className="label">标题 *</Text>
        <Input className="input" placeholder="一个吸引人的标题..." value={title} onInput={(e: any) => setTitle(e.detail.value)} />

        <Text className="label">分类 *</Text>
        <View className="cat-grid">
          {cats.map(c => (
            <View key={c} className={'cat-tag' + (category === c ? ' cat-active' : '')} onClick={() => setCategory(c)}>
              <Text>{c}</Text>
            </View>
          ))}
        </View>

        <Text className="label">内容 *</Text>
        <Textarea className="textarea" placeholder="分享你的想法..." value={content} onInput={(e: any) => setContent(e.detail.value)} />
      </View>

      <View className="submit-area">
        <Button className="submit-btn" onClick={submit}><Text>发布</Text></Button>
      </View>
    </ScrollView>
  )
}
