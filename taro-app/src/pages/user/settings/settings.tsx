import { useState } from 'react'
import { View, Text, ScrollView, Switch, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { showToast } from '../../../utils'
import './index.scss'

export default function Settings() {
  const [notif, setNotif] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(true)

  const accountMenus = [
    { icon: '👤', name: '个人资料', desc: '已绑定', action: 'profile' },
    { icon: '📱', name: '手机号', desc: '138****0000', action: 'phone' },
    { icon: '🔐', name: '修改密码', desc: '', action: 'password' },
    { icon: '🎓', name: '学生认证', desc: '已认证', action: 'verify' },
  ]

  const settingMenus = [
    { icon: '🔔', name: '消息通知', switch: true, value: notif, setter: setNotif },
    { icon: '🌙', name: '深色模式', switch: true, value: darkMode, setter: setDarkMode },
    { icon: '📲', name: '自动更新', switch: true, value: autoUpdate, setter: setAutoUpdate },
  ]

  const otherMenus = [
    { icon: '📦', name: '缓存清理', desc: '2.3 MB' },
    { icon: '📜', name: '关于我们', desc: 'v1.0.0' },
    { icon: '📋', name: '用户协议', desc: '' },
    { icon: '🛡', name: '隐私政策', desc: '' },
    { icon: '💬', name: '意见反馈', desc: '' },
    { icon: '📞', name: '联系客服', desc: '400-888-0000' },
  ]

  function clearCache() {
    Taro.showModal({
      title: '清理缓存',
      content: '确定清除应用缓存？',
      success: (res) => { if (res.confirm) showToast('清理完成', 'success') }
    })
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="section-title"><Text>账户</Text></View>
      <View className="card">
        {accountMenus.map((m, i) => (
          <View key={i} className="menu-item" onClick={() => showToast('功能开发中')}>
          <Text className="menu-icon">{m.icon}</Text>
          <View className="menu-body">
            <Text className="menu-name">{m.name}</Text>
            {m.desc && <Text className="menu-desc">{m.desc}</Text>}
          </View>
          <Text className="menu-arrow">›</Text>
        </View>
        ))}
      </View>

      <View className="section-title"><Text>设置</Text></View>
      <View className="card">
        {settingMenus.map((m, i) => (
          <View key={i} className="menu-item">
            <Text className="menu-icon">{m.icon}</Text>
            <Text className="menu-name">{m.name}</Text>
            <View className="menu-switch">
              <Switch checked={m.value} onChange={(e: any) => m.setter(e.detail.value)} color="#1890ff" />
            </View>
          </View>
        ))}
      </View>

      <View className="section-title"><Text>其他</Text></View>
      <View className="card">
        {otherMenus.map((m, i) => (
          <View key={i} className="menu-item" onClick={() => {
            if (m.name === '缓存清理') clearCache()
            else if (m.name === '意见反馈') showToast('感谢反馈', 'success')
            else showToast('敬请期待')
          }}>
            <Text className="menu-icon">{m.icon}</Text>
            <View className="menu-body">
              <Text className="menu-name">{m.name}</Text>
              {m.desc && <Text className="menu-desc">{m.desc}</Text>}
            </View>
            <Text className="menu-arrow">›</Text>
          </View>
        ))}
      </View>

      <View className="logout">
        <Button className="logout-btn" onClick={() => {
          Taro.showModal({
            title: '提示',
            content: '确定退出登录?',
            success: (res) => { if (res.confirm) { Taro.removeStorageSync('user_token'); Taro.redirectTo({ url: '/pages/user/login/login' }) } }
          })
        }}>
          <Text>退出登录</Text>
        </Button>
      </View>

      <View className="version"><Text>校园综合服务平台 v1.0.0</Text></View>
    </ScrollView>
  )
}
