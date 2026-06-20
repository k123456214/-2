import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button, Image, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast, formatPrice } from '../../../utils'
import './index.scss'

interface Block {
  id: number
  type: 'title' | 'richtext' | 'image' | 'button' | 'divider' | 'goods-list' | 'text' | 'empty'
  content?: string
  src?: string
  text?: string
  url?: string
  style?: any
  items?: any[]
}

export default function DiyPage() {
  const router = Taro.useRouter()
  const id = Number(router.params?.id || 1)
  const [page, setPage] = useState<{ title: string; blocks: Block[] } | null>(null)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const r: any = await api.diy.detail(id)
      if (r && r.blocks) {
        setPage({ title: r.title || '自定义页面', blocks: r.blocks })
      } else {
        // 默认 demo 数据
        setPage({
          title: r?.title || '校园专属活动',
          blocks: [
            { id: 1, type: 'image', src: '', content: '🎊' },
            { id: 2, type: 'title', content: '欢迎来到校园综合服务' },
            { id: 3, type: 'text', content: '一个专注校园生活的综合服务平台，提供外卖点餐、二手交易、跑腿代办、表白墙、兴趣社区等功能。' },
            { id: 4, type: 'divider' },
            { id: 5, type: 'title', content: '🔥 精选好物' },
            {
              id: 6,
              type: 'goods-list',
              items: [
                { id: 1, name: '校园外卖优惠券', price: 10, icon: '🎫' },
                { id: 2, name: '二手教材便宜卖', price: 25, icon: '📚' },
                { id: 3, name: '代取快递服务', price: 5, icon: '📦' },
              ]
            },
            { id: 7, type: 'divider' },
            { id: 8, type: 'richtext', content: '点击下方按钮，立即体验校园服务，下载APP享更多优惠。活动期间，新用户立减10元。' },
            { id: 9, type: 'button', text: '🎁 立即领取', url: '/pages/market/list/list' },
            { id: 10, type: 'empty', content: '— END —' },
          ]
        })
      }
    } catch (e) {
      console.error(e)
      setPage({
        title: '自定义页面',
        blocks: [
          { id: 1, type: 'title', content: '自定义动态页面' },
          { id: 2, type: 'text', content: '此页面内容由 API 返回，可通过管理后台配置组件顺序、图片、按钮跳转等。' },
          { id: 3, type: 'image', content: '✨' },
          { id: 4, type: 'button', text: '返回首页', url: '/pages/index/index' },
        ]
      })
    }
  }

  function onBlockClick(block: Block) {
    if (block.type === 'button' && block.url) {
      Taro.navigateTo({ url: block.url }).catch(() => showToast('跳转失败'))
    }
  }

  function renderBlock(b: Block, index: number) {
    switch (b.type) {
      case 'title':
        return <View key={b.id} className="block block-title"><Text>{b.content || ''}</Text></View>
      case 'text':
        return <View key={b.id} className="block block-text"><Text>{b.content || ''}</Text></View>
      case 'richtext':
        return <View key={b.id} className="block block-richtext"><Text>{b.content || ''}</Text></View>
      case 'image':
        return (
          <View key={b.id} className="block block-image">
            {b.src ? <Image src={b.src} className="image" mode="widthFix" /> : <Text className="image-emoji">{b.content || '🖼'}</Text>}
          </View>
        )
      case 'button':
        return (
          <View key={b.id} className="block block-button-wrap">
            <Button className="block-button" onClick={() => onBlockClick(b)}><Text>{b.text || '按钮'}</Text></Button>
          </View>
        )
      case 'divider':
        return <View key={b.id} className="block block-divider"><View className="divider-line" /></View>
      case 'goods-list':
        return (
          <View key={b.id} className="block block-goods">
            {(b.items || []).map((it: any) => (
              <View key={it.id} className="goods-item" onClick={() => showToast('点击 ' + it.name)}>
                <Text className="goods-icon">{it.icon || '📦'}</Text>
                <Text className="goods-name">{it.name}</Text>
                <Text className="goods-price">{formatPrice(it.price)}</Text>
              </View>
            ))}
          </View>
        )
      case 'empty':
        return <View key={b.id} className="block block-empty"><Text>{b.content || ''}</Text></View>
      default:
        return null
    }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">{page?.title || '自定义页面'}</Text>
      </View>
      <View className="content">
        {page?.blocks.map((b, i) => renderBlock(b, i))}
      </View>
      <View className="footer-note">
        <Text>— 以上内容动态渲染 —</Text>
      </View>
    </ScrollView>
  )
}
