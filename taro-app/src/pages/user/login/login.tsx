import { useState } from 'react'
import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '../../../services/api'
import { showToast } from '../../../utils'
import './index.scss'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<'code' | 'password'>('code')
  const [password, setPassword] = useState('')
  const [countdown, setCountdown] = useState(0)

  function sendCode() {
    if (!/^1\d{10}$/.test(phone)) { showToast('请输入正确的手机号'); return }
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    showToast('验证码已发送', 'success')
  }

  async function login() {
    if (!/^1\d{10}$/.test(phone)) { showToast('请输入正确的手机号'); return }
    if (mode === 'code' && !code) { showToast('请输入验证码'); return }
    if (mode === 'password' && !password) { showToast('请输入密码'); return }
    try {
      Taro.showLoading({ title: '登录中', mask: true })
      const payload: any = { phone }
      if (mode === 'code') payload.code = code
      else payload.password = password
      await api.user.login(payload)
      Taro.hideLoading()
      Taro.setStorageSync('user_token', 'mock_token_' + Date.now())
      showToast('登录成功', 'success')
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' }).catch(() => Taro.redirectTo({ url: '/pages/user/profile/profile' }))
      }, 800)
    } catch (e) {
      Taro.hideLoading()
      showToast('登录失败', 'error')
    }
  }

  return (
    <ScrollView scrollY className="page-scroll">
      <View className="hero">
        <View className="logo">🎓</View>
        <Text className="title">校园综合服务</Text>
        <Text className="subtitle">Campus Service Platform</Text>
      </View>

      <View className="form">
        <View className="mode-switch">
          <View className={'mode-item' + (mode === 'code' ? ' active' : '')} onClick={() => setMode('code')}>
            <Text>验证码登录</Text>
          </View>
          <View className={'mode-item' + (mode === 'password' ? ' active' : '')} onClick={() => setMode('password')}>
            <Text>密码登录</Text>
          </View>
        </View>

        <View className="input-group">
          <Text className="input-label">📱 手机号</Text>
          <Input className="input" type="number" maxlength={11} placeholder="请输入手机号" value={phone} onInput={(e: any) => setPhone(e.detail.value)} />
        </View>

        {mode === 'code' ? (
          <View className="input-group">
            <Text className="input-label">🔐 验证码</Text>
            <View className="input-row">
              <Input className="input code-input" type="number" maxlength={6} placeholder="请输入验证码" value={code} onInput={(e: any) => setCode(e.detail.value)} />
              <Button className="code-btn" onClick={sendCode} disabled={countdown > 0}>
                <Text>{countdown > 0 ? countdown + 's' : '获取验证码'}</Text>
              </Button>
            </View>
          </View>
        ) : (
          <View className="input-group">
            <Text className="input-label">🔑 密码</Text>
            <Input className="input" password placeholder="请输入密码" value={password} onInput={(e: any) => setPassword(e.detail.value)} />
          </View>
        )}

        <Button className="login-btn" onClick={login}>
          <Text>登 录</Text>
        </Button>

        <View className="tips-row">
          <Text className="tip" onClick={() => showToast('请联系管理员重置密码')}>忘记密码?</Text>
          <Text className="tip" onClick={() => showToast('暂无注册功能')}>注册新账号</Text>
        </View>

        <View className="agreement">
          <Text>登录即表示同意《用户协议》和《隐私政策》</Text>
        </View>
      </View>

      <View className="third-party">
        <Text className="tp-title">— 其他登录方式 —</Text>
        <View className="tp-icons">
          <View className="tp-item" onClick={() => showToast('微信登录')}>
            <Text className="tp-icon">💚</Text>
            <Text className="tp-name">微信</Text>
          </View>
          <View className="tp-item" onClick={() => showToast('QQ登录')}>
            <Text className="tp-icon">🐧</Text>
            <Text className="tp-name">QQ</Text>
          </View>
          <View className="tp-item" onClick={() => showToast('校园账号')}>
            <Text className="tp-icon">🎓</Text>
            <Text className="tp-name">校园</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
