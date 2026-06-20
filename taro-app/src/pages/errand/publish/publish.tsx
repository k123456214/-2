import { useState } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function ErrandPublish() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('取快递')
  const [desc, setDesc] = useState('')
  const [pickup, setPickup] = useState('')
  const [delivery, setDelivery] = useState('')
  const [phone, setPhone] = useState('')
  const [price, setPrice] = useState<string>('')
  const types = ['取快递', '代购', '代打印', '其他']

  async function submit() {
    if (!title || !price || !pickup || !delivery) { showToast('请完善信息'); return }
    try {
      Taro.showLoading({ title: '发布中', mask: true })
      await api.errand.create({
        title, type, desc, pickup, delivery, phone, price: Number(price)
      })
      Taro.hideLoading()
      showToast('发布成功', 'success')
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (e) { Taro.hideLoading(); showToast('发布失败', 'error') }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="card">
        <Text className="label">任务标题 *</Text>
        <Input className="input" placeholder="例如：帮我取个快递到3号宿舍楼" value={title} onInput={(e: any) => setTitle(e.detail.value)} />

        <Text className="label">任务类型 *</Text>
        <View className="cat-grid">
          {types.map(t => (
            <View key={t} className={'cat-tag' + (type === t ? ' cat-active' : '')} onClick={() => setType(t)}>
              <Text>{t}</Text>
            </View>
          ))}
        </View>

        <Text className="label">取件地址 *</Text>
        <Input className="input" placeholder="如：菜鸟驿站 / 东门快递柜" value={pickup} onInput={(e: any) => setPickup(e.detail.value)} />

        <Text className="label">送达地址 *</Text>
        <Input className="input" placeholder="如：3号宿舍楼502室" value={delivery} onInput={(e: any) => setDelivery(e.detail.value)} />

        <Text className="label">联系电话</Text>
        <Input className="input" type="number" placeholder="方便跑腿联系你" value={phone} onInput={(e: any) => setPhone(e.detail.value)} />

        <Text className="label">报酬 (¥) *</Text>
        <Input className="input" type="digit" placeholder="5.00" value={price} onInput={(e: any) => setPrice(e.detail.value)} />

        <Text className="label">备注</Text>
        <Textarea className="textarea" placeholder="取件码、特殊要求等" value={desc} onInput={(e: any) => setDesc(e.detail.value)} />
      </View>

      <View className="submit-area">
        <Button className="submit-btn" onClick={submit}><Text>发布任务</Text></Button>
      </View>
    </ScrollView>
  )
}
