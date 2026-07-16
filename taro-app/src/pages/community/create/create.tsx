import { useState } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function CreateCommunity() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('学习')
  const [desc, setDesc] = useState('')

  const cats = ['学习', '运动', '音乐', '游戏', '摄影', '旅行', '美食', '阅读']

  async function submit() {
    if (!name || !desc) { showToast('请填写完整信息'); return }
    try {
      Taro.showLoading({ title: '创建中', mask: true })
      await api.community.create({ name, category, desc })
      Taro.hideLoading()
      showToast('创建成功', 'success')
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (e) { Taro.hideLoading(); showToast('创建失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="card">
        <Text className="label">社区名称 *</Text>
        <Input className="input" placeholder="给你的社区起个响亮的名字" value={name} onInput={(e: any) => setName(e.detail.value)} />

        <Text className="label">社区类目 *</Text>
        <View className="cat-grid">
          {cats.map(c => (
            <View key={c} className={'cat-tag' + (category === c ? ' cat-active' : '')} onClick={() => setCategory(c)}>
              <Text>{c}</Text>
            </View>
          ))}
        </View>

        <Text className="label">社区简介 *</Text>
        <Textarea className="textarea" placeholder="介绍社区主题、活动、成员要求等" value={desc} onInput={(e: any) => setDesc(e.detail.value)} />
      </View>

      <View className="submit-area">
        <Button className="submit-btn" onClick={submit}><Text>创建社区</Text></Button>
      </View>
    </ScrollView>
  )
}
