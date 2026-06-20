import { useEffect, useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface AttrOption { id: number; name: string; pricePerAddon?: number }
interface Attribute {
  id: number;
  name: string;
  type: 'select' | 'multiselect' | 'number';
  options?: AttrOption[];
  min?: number;
  max?: number;
  step?: number;
}
interface Goods { id: number; name: string; price: number; desc?: string; stock: number; category?: string; attributes?: Attribute[] }

export default function Shop() {
  const router = Taro.useRouter()
  const shopId = Number(router.params?.shopId || 1)
  const [shop, setShop] = useState<any>(null)
  const [goods, setGoods] = useState<Goods[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCat, setActiveCat] = useState('all')
  const [cart, setCart] = useState<Record<number, { goods: Goods; qty: number; selectedAttrs: Record<number, any> }>>({})
  const [activeGoods, setActiveGoods] = useState<Goods | null>(null)
  const [tempAttrs, setTempAttrs] = useState<Record<number, any>>({})
  const [tempQty, setTempQty] = useState(1)

  useEffect(() => { loadShop() }, [shopId])

  async function loadShop() {
    try {
      const [s, g] = await Promise.all([api.merchant.detail(shopId), api.goods.list({ merchantId: shopId })])
      setShop(s)
      const list = (g as any).list || g || []
      setGoods(list)
      const cats = Array.from(new Set(list.map((x: Goods) => x.category || '其他'))) as string[]
      setCategories(cats.length ? cats : ['推荐'])
    } catch (e) { console.error(e) }
  }

  const filtered = useMemo(() => {
    if (activeCat === 'all') return goods
    return goods.filter(g => (g.category || '其他') === activeCat)
  }, [goods, activeCat])

  const cartTotal = useMemo(() => {
    let total = 0; let count = 0
    Object.values(cart).forEach(item => {
      let price = item.goods.price
      item.goods.attributes?.forEach(attr => {
        const sel = item.selectedAttrs[attr.id]
        if (attr.type === 'select' && attr.options) {
          const opt = attr.options.find(o => o.id === sel)
          if (opt?.pricePerAddon) price += opt.pricePerAddon
        } else if (attr.type === 'multiselect' && Array.isArray(sel)) {
          sel.forEach((oid: number) => {
            const opt = attr.options?.find(o => o.id === oid)
            if (opt?.pricePerAddon) price += opt.pricePerAddon
          })
        } else if (attr.type === 'number' && typeof sel === 'number') {
          price += (sel - (attr.min || 0)) * 2
        }
      })
      total += price * item.qty
      count += item.qty
    })
    return { total, count }
  }, [cart])

  function openGoods(g: Goods) {
    const defaults: Record<number, any> = {}
    g.attributes?.forEach(attr => {
      if (attr.type === 'select' && attr.options?.length) defaults[attr.id] = attr.options[0].id
      else if (attr.type === 'multiselect') defaults[attr.id] = []
      else if (attr.type === 'number') defaults[attr.id] = attr.min || 1
    })
    setTempAttrs(defaults)
    setTempQty(1)
    setActiveGoods(g)
  }

  function closeGoods() { setActiveGoods(null) }

  function addToCart() {
    if (!activeGoods) return
    const key = buildCartKey(activeGoods, tempAttrs)
    setCart(prev => {
      const next = { ...prev }
      if (next[key]) next[key] = { ...next[key], qty: next[key].qty + tempQty }
      else next[key] = { goods: activeGoods, qty: tempQty, selectedAttrs: { ...tempAttrs } }
      return next
    })
    setActiveGoods(null)
    showToast('已加入购物车', 'success')
  }

  function buildCartKey(g: Goods, attrs: Record<number, any>): number {
    let s = g.id * 1000000
    Object.keys(attrs).forEach(k => {
      const v = attrs[Number(k)]
      s += (typeof v === 'number' ? v : Array.isArray(v) ? v.reduce((a, b) => a + b, 0) : 0)
    })
    return s
  }

  function itemPrice(g: Goods, attrs: Record<number, any>): number {
    let price = g.price
    g.attributes?.forEach(attr => {
      const sel = attrs[attr.id]
      if (attr.type === 'select' && attr.options) {
        const opt = attr.options.find(o => o.id === sel)
        if (opt?.pricePerAddon) price += opt.pricePerAddon
      } else if (attr.type === 'multiselect' && Array.isArray(sel)) {
        sel.forEach((oid: number) => {
          const opt = attr.options?.find(o => o.id === oid)
          if (opt?.pricePerAddon) price += opt.pricePerAddon
        })
      }
    })
    return price
  }

  function incCart(key: number) { setCart(p => ({ ...p, [key]: { ...p[key], qty: p[key].qty + 1 } })) }
  function decCart(key: number) {
    setCart(p => {
      const next = { ...p }
      if (next[key].qty > 1) next[key] = { ...next[key], qty: next[key].qty - 1 }
      else delete next[key]
      return next
    })
  }

  function goCheckout() {
    if (cartTotal.count === 0) { showToast('请先选择商品'); return }
    const items = Object.entries(cart).map(([k, item]) => ({
      key: k, goodsId: item.goods.id, name: item.goods.name, qty: item.qty,
      price: itemPrice(item.goods, item.selectedAttrs),
      attrs: item.selectedAttrs
    }))
    Taro.setStorageSync('checkout_items', items)
    Taro.setStorageSync('checkout_shop', shopId)
    Taro.navigateTo({ url: '/pages/food/checkout/checkout' })
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="shop-header">
        <View className="shop-title-bar">
          <Text className="shop-title">{shop?.name || '商户详情'}</Text>
          <Text className="shop-sub">★ {Number(shop?.rating || 4.8).toFixed(1)} · 月销{shop?.sales || 100}</Text>
        </View>
        <Text className="shop-info-text">{shop?.address || '校园综合服务中心'}</Text>
        <View className="shop-tags">
          <Text className="shop-tag">起送 {formatPrice(shop?.minOrder || 15)}</Text>
          <Text className="shop-tag">配送 {formatPrice(shop?.deliveryFee || 3)}</Text>
        </View>
      </View>

      <View className="shop-body">
        <View className="cat-col">
          <View
            key="all"
            className={'cat-item' + (activeCat === 'all' ? ' active' : '')}
            onClick={() => setActiveCat('all')}
          ><Text>全部</Text></View>
          {categories.map(c => (
            <View
              key={c}
              className={'cat-item' + (activeCat === c ? ' active' : '')}
              onClick={() => setActiveCat(c)}
            ><Text>{c}</Text></View>
          ))}
        </View>
        <View className="goods-col">
          {filtered.map(g => (
            <View key={g.id} className="goods-item" onClick={() => openGoods(g)}>
              <View className="goods-thumb">🍜</View>
              <View className="goods-info">
                <Text className="goods-name">{g.name}</Text>
                <Text className="goods-desc">{g.desc || '美味可口'}</Text>
                <View className="goods-bottom">
                  <Text className="goods-price">{formatPrice(g.price)}</Text>
                  <View className="add-btn" onClick={(e) => { e.stopPropagation(); openGoods(g) }}>
                    <Text>+</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
          {filtered.length === 0 && <View className="empty"><Text>该分类暂无商品</Text></View>}
        </View>
      </View>

      <View className="cart-bar">
        <View className="cart-icon" onClick={() => cartTotal.count > 0 && setCart({})}>
          <Text>🛒</Text>
          {cartTotal.count > 0 && <Text className="cart-badge">{cartTotal.count}</Text>}
        </View>
        <View className="cart-info">
          <Text className="cart-total">{formatPrice(cartTotal.total)}</Text>
          <Text className="cart-delivery">另需配送费 {formatPrice(shop?.deliveryFee || 3)}</Text>
        </View>
        <View className={'checkout-btn' + (cartTotal.count > 0 ? '' : ' disabled')} onClick={goCheckout}>
          <Text>去结算</Text>
        </View>
      </View>

      {activeGoods && (
        <View className="modal-mask" onClick={closeGoods}>
          <View className="modal" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">{activeGoods.name}</Text>
              <Text className="modal-price">{formatPrice(activeGoods.price)} 起</Text>
            </View>
            <ScrollView scrollY className="modal-body" style={{ maxHeight: '60vh' }}>
              {activeGoods.attributes?.map(attr => (
                <View key={attr.id} className="attr-block">
                  <Text className="attr-name">{attr.name}
                    {attr.type === 'multiselect' && <Text className="attr-tip">（可多选）</Text>}
                    {attr.type === 'number' && <Text className="attr-tip">（数量）</Text>}
                  </Text>
                  {attr.type === 'select' && attr.options && (
                    <View className="attr-options">
                      {attr.options.map(opt => (
                        <View
                          key={opt.id}
                          className={'opt' + (tempAttrs[attr.id] === opt.id ? ' opt-active' : '')}
                          onClick={() => setTempAttrs({ ...tempAttrs, [attr.id]: opt.id })}
                        >
                          <Text>{opt.name}</Text>
                          {opt.pricePerAddon ? <Text className="opt-price">+{formatPrice(opt.pricePerAddon)}</Text> : null}
                        </View>
                      ))}
                    </View>
                  )}
                  {attr.type === 'multiselect' && attr.options && (
                    <View className="attr-options">
                      {attr.options.map(opt => {
                        const arr: number[] = Array.isArray(tempAttrs[attr.id]) ? tempAttrs[attr.id] : []
                        const checked = arr.includes(opt.id)
                        return (
                          <View
                            key={opt.id}
                            className={'opt' + (checked ? ' opt-active' : '')}
                            onClick={() => {
                              const next = checked ? arr.filter(x => x !== opt.id) : [...arr, opt.id]
                              setTempAttrs({ ...tempAttrs, [attr.id]: next })
                            }}
                          >
                            <Text>{opt.name}</Text>
                            {opt.pricePerAddon ? <Text className="opt-price">+{formatPrice(opt.pricePerAddon)}</Text> : null}
                          </View>
                        )
                      })}
                    </View>
                  )}
                  {attr.type === 'number' && (
                    <View className="num-row">
                      <View className="num-btn" onClick={() => setTempAttrs({ ...tempAttrs, [attr.id]: Math.max(attr.min || 1, (tempAttrs[attr.id] || 1) - 1) })}>
                        <Text>-</Text>
                      </View>
                      <Text className="num-val">{tempAttrs[attr.id] || attr.min || 1}</Text>
                      <View className="num-btn" onClick={() => setTempAttrs({ ...tempAttrs, [attr.id]: Math.min(attr.max || 99, (tempAttrs[attr.id] || 1) + 1) })}>
                        <Text>+</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
              <View className="attr-block">
                <Text className="attr-name">购买数量</Text>
                <View className="num-row">
                  <View className="num-btn" onClick={() => setTempQty(Math.max(1, tempQty - 1))}><Text>-</Text></View>
                  <Text className="num-val">{tempQty}</Text>
                  <View className="num-btn" onClick={() => setTempQty(tempQty + 1)}><Text>+</Text></View>
                </View>
              </View>
            </ScrollView>
            <View className="modal-footer">
              <Button className="add-cart-btn" onClick={addToCart}>
                <Text>加入购物车 · {formatPrice(itemPrice(activeGoods, tempAttrs) * tempQty)}</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}
