import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface Goods { id: number; name: string; price: number; status: number; stock: number; sales: number }

export default function GoodsManage() {
  const [list, setList] = useState<Goods[]>([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const r = await api.goods.list()
      setList((r as any).list || r || [])
    } catch (e) { console.error(e) }
  }

  async function toggleStatus(g: Goods) {
    try {
      const next = g.status === 1 ? 0 : 1
      await api.goods.toggleStatus(g.id, next)
      setList(prev => prev.map(x => x.id === g.id ? { ...x, status: next } : x))
      showToast('操作成功', 'success')
    } catch (e) { showToast('操作失败', 'error') }
  }

  async function remove(id: number) {
    try {
      Taro.showLoading({ title: '删除中' })
      await api.goods.remove(id)
      Taro.hideLoading()
      setList(prev => prev.filter(x => x.id !== id))
      showToast('已删除', 'success')
    } catch (e) { Taro.hideLoading(); showToast('删除失败', 'error') }
  }

  function addNew() { Taro.navigateTo({ url: '/pages/merchant/goods-edit/goods-edit?id=0' }) }
  function edit(id: number) { Taro.navigateTo({ url: '/pages/merchant/goods-edit/goods-edit?id=' + id }) }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="head-bar">
        <Text className="head-title">共 {list.length} 件商品</Text>
        <Button className="add-btn" onClick={addNew}>
          <Text>+ 添加商品</Text>
        </Button>
      </View>

      {list.map((g: Goods) => (
        <View key={g.id} className="goods-card">
          <View className="goods-thumb">🍜</View>
          <View className="goods-body">
            <Text className="goods-name">{g.name}</Text>
            <Text className="goods-meta">库存 {g.stock || 100} · 销量 {g.sales || 0}</Text>
            <Text className="goods-price">{formatPrice(g.price)}</Text>
          </View>
          <View className="goods-side">
            <View className="status-row">
              <Text className="status-label">{g.status === 1 ? '上架' : '下架'}</Text>
              <Switch checked={g.status === 1} onChange={() => toggleStatus(g)} color="#1890ff" />
            </View>
            <View className="btn-row">
              <Button className="mini-btn" onClick={() => edit(g.id)}><Text>编辑</Text></Button>
              <Button className="mini-btn-danger" onClick={() => remove(g.id)}><Text>删除</Text></Button>
            </View>
          </View>
        </View>
      ))}
      {list.length === 0 && <View className="empty"><Text>暂无商品，点击右上角添加</Text></View>}
    </ScrollView>
  )
}
