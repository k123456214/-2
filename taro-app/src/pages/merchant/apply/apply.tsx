import { useState } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function Apply() {
  const [form, setForm] = useState({
    name: '',
    category: '快餐',
    phone: '',
    address: '',
    hours: '09:00 - 22:00',
    desc: '',
    license: '',
    minOrder: 15,
    deliveryFee: 3
  })

  function updateField(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit() {
    if (!form.name || !form.phone || !form.address) {
      showToast('请填写完整信息')
      return
    }
    try {
      Taro.showLoading({ title: '提交中', mask: true })
      await api.merchant.apply(form)
      Taro.hideLoading()
      showToast('已提交，等待审核', 'success')
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (e) {
      Taro.hideLoading()
      showToast('提交失败', 'error')
    }
  }

  const cats = ['快餐', '汉堡', '奶茶', '咖啡', '小吃', '甜品', '中式', '日式', '韩式', '生活服务']

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="tip">
        <Text>✏️ 请如实填写店铺信息，我们将在1-2个工作日内完成审核</Text>
      </View>

      <View className="card">
        <Text className="label">店铺名称 *</Text>
        <Input className="input" placeholder="请输入店铺名称" value={form.name} onInput={(e: any) => updateField('name', e.detail.value)} />

        <Text className="label">经营类目 *</Text>
        <View className="cat-grid">
          {cats.map(c => (
            <View key={c} className={'cat-tag' + (form.category === c ? ' cat-active' : '')} onClick={() => updateField('category', c)}>
              <Text>{c}</Text>
            </View>
          ))}
        </View>

        <Text className="label">联系电话 *</Text>
        <Input className="input" type="number" placeholder="请输入联系电话" value={form.phone} onInput={(e: any) => updateField('phone', e.detail.value)} />

        <Text className="label">店铺地址 *</Text>
        <Input className="input" placeholder="请输入详细地址" value={form.address} onInput={(e: any) => updateField('address', e.detail.value)} />

        <Text className="label">营业时间</Text>
        <Input className="input" placeholder="例如 09:00 - 22:00" value={form.hours} onInput={(e: any) => updateField('hours', e.detail.value)} />

        <Text className="label">店铺介绍</Text>
        <Textarea className="textarea" placeholder="介绍下你的店铺特色..." value={form.desc} onInput={(e: any) => updateField('desc', e.detail.value)} />

        <Text className="label">营业执照编号</Text>
        <Input className="input" placeholder="请输入营业执照编号" value={form.license} onInput={(e: any) => updateField('license', e.detail.value)} />

        <View className="row-2">
          <View className="row-item">
            <Text className="label">起送价 (¥)</Text>
            <Input className="input" type="digit" value={String(form.minOrder)} onInput={(e: any) => updateField('minOrder', Number(e.detail.value))} />
          </View>
          <View className="row-item">
            <Text className="label">配送费 (¥)</Text>
            <Input className="input" type="digit" value={String(form.deliveryFee)} onInput={(e: any) => updateField('deliveryFee', Number(e.detail.value))} />
          </View>
        </View>
      </View>

      <View className="submit-area">
        <Button className="submit-btn" onClick={submit}>
          <Text>提交申请</Text>
        </Button>
      </View>
    </ScrollView>
  )
}
