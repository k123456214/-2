import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Navigator, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function H5Page() {
  const router = Taro.useRouter()
  const url = router.params?.url || ''
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 500)
  }, [])

  const menuItems = [
    { icon: '🎓', name: '校园官网', url: 'https://example.edu.cn' },
    { icon: '📖', name: '图书馆系统', url: 'https://example.edu.cn/lib' },
    { icon: '📊', name: '成绩查询', url: 'https://example.edu.cn/score' },
    { icon: '🏫', name: '教务处', url: 'https://example.edu.cn/jwc' },
    { icon: '💼', name: '就业中心', url: 'https://example.edu.cn/job' },
    { icon: '🏥', name: '校医院', url: 'https://example.edu.cn/hospital' },
  ]

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <Text className="hero-title">🌐 H5 链接</Text>
        <Text className="hero-sub">打开外部网页与校内系统</Text>
      </View>

      {url && (
        <View className="card">
          <Text className="card-title">当前链接</Text>
          <View className="url-box"><Text className="url-text">{url}</Text></View>
          <Button className="open-btn" onClick={() => showToast('即将跳转 ' + url)}><Text>在浏览器打开</Text></Button>
        </View>
      )}

      <View className="card">
        <Text className="card-title">常用链接</Text>
        {menuItems.map((item, idx) => (
          <View key={idx} className="link-item" onClick={() => Taro.showToast({ title: '即将打开 ' + item.name, icon: 'none' })}>
            <Text className="link-icon">{item.icon}</Text>
            <Text className="link-name">{item.name}</Text>
            <Text className="link-arrow">›</Text>
          </View>
        ))}
      </View>

      <View className="card tip">
        <Text className="tip-title">💡 使用提示</Text>
        <Text className="tip-text">H5 页面会在系统浏览器中打开以获得更好的兼容性体验。校园系统链接需要校园网环境访问。</Text>
      </View>
    </ScrollView>
  )
}

function showToast(title: string) { Taro.showToast({ title, icon: 'none' }) }
