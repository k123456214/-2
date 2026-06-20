import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

interface AttrOption { id: number; name: string; pricePerAddon?: number }
interface Attribute { id: number; name: string; type: 'select' | 'multiselect' | 'number'; options?: AttrOption[]; min?: number; max?: number; step?: number }

export default function GoodsEdit() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 0)
  const isEdit = id > 0

  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [stock, setStock] = useState<number>(100)
  const [category, setCategory] = useState('快餐')
  const [desc, setDesc] = useState('')
  const [attrs, setAttrs] = useState<Attribute[]>([])

  useEffect(() => { if (isEdit) loadData() }, [id])

  async function loadData() {
    try {
      const g: any = await api.goods.detail(id)
      if (g) {
        setName(g.name || '')
        setPrice(Number(g.price) || 0)
        setStock(Number(g.stock) || 100)
        setCategory(g.category || '快餐')
        setDesc(g.desc || '')
        setAttrs(g.attributes || [])
      }
    } catch (e) { console.error(e) }
  }

  function addAttr(type: 'select' | 'multiselect' | 'number') {
    const newAttr: Attribute = {
      id: Date.now(),
      name: type === 'number' ? '数量' : (type === 'multiselect' ? '加料' : '规格'),
      type,
      options: type === 'number' ? undefined : [{ id: Date.now() + 1, name: '默认' }],
      min: type === 'number' ? 1 : undefined,
      max: type === 'number' ? 10 : undefined,
      step: type === 'number' ? 1 : undefined
    }
    setAttrs([...attrs, newAttr])
  }

  function updateAttr(attrId: number, field: string, value: any) {
    setAttrs(prev => prev.map(a => a.id === attrId ? { ...a, [field]: value } : a))
  }

  function removeAttr(attrId: number) {
    setAttrs(prev => prev.filter(a => a.id !== attrId))
  }

  function addOption(attrId: number) {
    setAttrs(prev => prev.map(a => a.id === attrId && a.options
      ? { ...a, options: [...a.options, { id: Date.now(), name: '新选项' }] }
      : a))
  }

  function updateOption(attrId: number, optId: number, field: string, value: any) {
    setAttrs(prev => prev.map(a => a.id === attrId && a.options
      ? { ...a, options: a.options.map(o => o.id === optId ? { ...o, [field]: value } : o) }
      : a))
  }

  function removeOption(attrId: number, optId: number) {
    setAttrs(prev => prev.map(a => a.id === attrId && a.options
      ? { ...a, options: a.options.filter(o => o.id !== optId) }
      : a))
  }

  async function submit() {
    if (!name || price <= 0) { showToast('请完善商品信息'); return }
    try {
      Taro.showLoading({ title: '保存中', mask: true })
      const payload = { name, price, stock, category, desc, attributes: attrs }
      if (isEdit) await api.goods.update(id, payload)
      else await api.goods.create(payload)
      Taro.hideLoading()
      showToast(isEdit ? '已更新' : '已创建', 'success')
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (e) {
      Taro.hideLoading()
      showToast('保存失败', 'error')
    }
  }

  const cats = ['快餐', '汉堡', '奶茶', '咖啡', '小吃', '甜品', '中式', '日式', '韩式']

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="card">
        <Text className="label">商品名称 *</Text>
        <Input className="input" placeholder="请输入商品名称" value={name} onInput={(e: any) => setName(e.detail.value)} />

        <Text className="label">销售价 (¥) *</Text>
        <Input className="input" type="digit" value={String(price)} onInput={(e: any) => setPrice(Number(e.detail.value) || 0)} />

        <View className="row-2">
          <View className="row-item">
            <Text className="label">库存</Text>
            <Input className="input" type="number" value={String(stock)} onInput={(e: any) => setStock(Number(e.detail.value) || 0)} />
          </View>
          <View className="row-item">
            <Text className="label">分类</Text>
            <View className="cat-picker">
              <Text style={{ color: '#333' }}>{category}</Text>
              <Text style={{ color: '#999', fontSize: 22 }}>▾</Text>
            </View>
          </View>
        </View>
        <View className="cat-grid">
          {cats.map(c => (
            <View key={c} className={'cat-tag' + (category === c ? ' cat-active' : '')} onClick={() => setCategory(c)}>
              <Text>{c}</Text>
            </View>
          ))}
        </View>

        <Text className="label">商品描述</Text>
        <Textarea className="textarea" placeholder="商品描述、口味说明等..." value={desc} onInput={(e: any) => setDesc(e.detail.value)} />
      </View>

      <View className="card">
        <View className="section-head">
          <Text className="section-title">商品规格 / 选项</Text>
          <Text className="section-desc">支持动态添加选择、多选、数量等属性</Text>
        </View>

        <View className="type-row">
          <Button className="type-btn" onClick={() => addAttr('select')}><Text>+ 单选规格</Text></Button>
          <Button className="type-btn" onClick={() => addAttr('multiselect')}><Text>+ 多选加料</Text></Button>
          <Button className="type-btn" onClick={() => addAttr('number')}><Text>+ 数字输入</Text></Button>
        </View>

        {attrs.map((attr, idx) => (
          <View key={attr.id} className="attr-card">
            <View className="attr-head">
              <Text className="attr-idx">属性 {idx + 1}</Text>
              <Text className="attr-type">{attr.type === 'select' ? '单选' : attr.type === 'multiselect' ? '多选' : '数字'}</Text>
              <Text className="attr-del" onClick={() => removeAttr(attr.id)}>删除</Text>
            </View>

            <Text className="label">属性名称</Text>
            <Input className="input" placeholder="如 大小/甜度/加料" value={attr.name} onInput={(e: any) => updateAttr(attr.id, 'name', e.detail.value)} />

            {(attr.type === 'select' || attr.type === 'multiselect') && attr.options && (
              <>
                <Text className="label">选项列表</Text>
                {attr.options.map((opt, oi) => (
                  <View key={opt.id} className="opt-row">
                    <Input
                      className="opt-name"
                      placeholder="选项名"
                      value={opt.name}
                      onInput={(e: any) => updateOption(attr.id, opt.id, 'name', e.detail.value)}
                    />
                    <Input
                      className="opt-price"
                      type="digit"
                      placeholder="+¥"
                      value={opt.pricePerAddon ? String(opt.pricePerAddon) : ''}
                      onInput={(e: any) => updateOption(attr.id, opt.id, 'pricePerAddon', Number(e.detail.value) || 0)}
                    />
                    <Text className="opt-del" onClick={() => removeOption(attr.id, opt.id)}>×</Text>
                  </View>
                ))}
                <Button className="add-opt-btn" onClick={() => addOption(attr.id)}><Text>+ 添加选项</Text></Button>
              </>
            )}

            {attr.type === 'number' && (
              <View className="num-row-3">
                <View className="num-item">
                  <Text className="label">最小值</Text>
                  <Input className="input" type="number" value={String(attr.min ?? 1)} onInput={(e: any) => updateAttr(attr.id, 'min', Number(e.detail.value) || 0)} />
                </View>
                <View className="num-item">
                  <Text className="label">最大值</Text>
                  <Input className="input" type="number" value={String(attr.max ?? 10)} onInput={(e: any) => updateAttr(attr.id, 'max', Number(e.detail.value) || 0)} />
                </View>
                <View className="num-item">
                  <Text className="label">步长</Text>
                  <Input className="input" type="number" value={String(attr.step ?? 1)} onInput={(e: any) => updateAttr(attr.id, 'step', Number(e.detail.value) || 1)} />
                </View>
              </View>
            )}
          </View>
        ))}

        {attrs.length === 0 && <View className="empty-tip"><Text>暂无属性，点击上方按钮添加</Text></View>}
      </View>

      <View className="submit-area">
        <Button className="submit-btn" onClick={submit}><Text>{isEdit ? '保存修改' : '创建商品'}</Text></Button>
      </View>
    </ScrollView>
  )
}
