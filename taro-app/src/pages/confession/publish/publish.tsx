import { useState } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function ConfessionPublish() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [gender, setGender] = useState('女')

  async function submit() {
    if (!title || !content) { showToast('请填写完整'); return }
    try {
      Taro.showLoading({ title: '发布中', mask: true })
      await api.confession.create({ title, content, anonymous, gender })
      Taro.hideLoading()
      showToast('发布成功', 'success')
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (e) { Taro.hideLoading(); showToast('发布失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="card">
        <Text className="label">标题 *</Text>
        <Input className="input" placeholder="例如：致图书馆靠窗的女孩" value={title} onInput={(e: any) => setTitle(e.detail.value)} />

        <Text className="label">内容 *</Text>
        <Textarea className="textarea" placeholder="写下你的心意..." value={content} onInput={(e: any) => setContent(e.detail.value)} />

        <View className="row">
          <Text className="label-row">匿名发布</Text>
          <Switch checked={anonymous} onChange={(e: any) => setAnonymous(e.detail.value)} color="#f5222d" />
        </View>

        <Text className="label">你的性别</Text>
        <View className="gender-row">
          {['男', '女'].map(g => (
            <View key={g} className={'gender' + (gender === g ? ' active' : '')} onClick={() => setGender(g)}>
              <Text>{g === '男' ? '♂ 男生' : '♀ 女生'}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="submit-area">
        <Button className="submit-btn" onClick={submit}><Text>匿名发布 💌</Text></Button>
      </View>
    </ScrollView>
  )
}
