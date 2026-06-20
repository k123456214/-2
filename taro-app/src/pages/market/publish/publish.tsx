import { useState } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function MarketPublish() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState<string>('')
  const [originalPrice, setOriginalPrice] = useState<string>('')
  const [category, setCategory] = useState('数码')
  const [location, setLocation] = useState('校内')
  const [desc, setDesc] = useState('')
  const cats = ['数码', '教材', '生活用品', '服饰', '运动', '美妆', '其他']

  async function submit() {
    if (!title || !price) { showToast('请完善商品信息'); return }
    try {
      Taro.showLoading({ title: '发布中', mask: true })
      await api.market.create({
        title,
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        category, location, desc
      })
      Taro.hideLoading()
      showToast('发布成功', 'success')
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (e) { Taro.hideLoading(); showToast('发布失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="upload-box">
        <Text className="upload-icon">📷</Text>
        <Text className="upload-text">点击上传商品图片</Text>
      </View>

      <View className="card">
        <Text className="label">商品标题 *</Text>
        <Input className="input" placeholder="例如：九成新 iPad 2023" value={title} onInput={(e: any) => setTitle(e.detail.value)} />

        <View className="row-2">
          <View className="row-item">
            <Text className="label">售价 (¥)</Text>
            <Input className="input" type="digit" placeholder="0.00" value={price} onInput={(e: any) => setPrice(e.detail.value)} />
          </View>
          <View className="row-item">
            <Text className="label">原价 (¥)</Text>
            <Input className="input" type="digit" placeholder="0.00" value={originalPrice} onInput={(e: any) => setOriginalPrice(e.detail.value)} />
          </View>
        </View>

        <Text className="label">分类</Text>
        <View className="cat-grid">
          {cats.map(c => (
            <View key={c} className={'cat-tag' + (category === c ? ' cat-active' : '')} onClick={() => setCategory(c)}>
              <Text>{c}</Text>
            </View>
          ))}
        </View>

        <Text className="label">交易地点</Text>
        <Input className="input" placeholder="校内 / 宿舍楼" value={location} onInput={(e: any) => setLocation(e.detail.value)} />

        <Text className="label">商品描述</Text>
        <Textarea className="textarea" placeholder="描述成色、使用情况、交易方式等" value={desc} onInput={(e: any) => setDesc(e.detail.value)} />
      </View>

      <View className="submit-area">
        <Button className="submit-btn" onClick={submit}><Text>发布</Text></Button>
      </View>
    </ScrollView>
  )
}
