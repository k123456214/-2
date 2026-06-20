// src/utils/index.ts - 通用工具函数（多端兼容）
import Taro from '@tarojs/taro'

export function formatTime(date: Date | number): string {
  if (typeof date === 'number') date = new Date(date)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 3600 * 1000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400 * 1000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 86400 * 1000 * 7) return Math.floor(diff / 86400000) + '天前'
  return formatTime(ts)
}

export function formatPrice(price: number | string): string {
  return '¥' + Number(price || 0).toFixed(2)
}

export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none', duration = 2000) {
  Taro.showToast({ title, icon, duration })
}

export function showLoading(title = '加载中...') {
  Taro.showLoading({ title, mask: true })
}

export function hideLoading() {
  Taro.hideLoading()
}

export async function confirm(title: string, content: string): Promise<boolean> {
  try {
    const res = await Taro.showModal({ title, content, confirmText: '确定', cancelText: '取消' })
    return !!res.confirm
  } catch {
    return false
  }
}

export function navigateTo(url: string) {
  Taro.navigateTo({ url })
}

export function switchTab(url: string) {
  Taro.switchTab({ url })
}

export function redirectTo(url: string) {
  Taro.redirectTo({ url })
}

export function navigateBack(delta = 1) {
  Taro.navigateBack({ delta })
}

export function getStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const v = Taro.getStorageSync(key)
    return v || defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorage(key: string, value: any) {
  try {
    Taro.setStorageSync(key, value)
  } catch (e) {
    console.warn('setStorage failed', e)
  }
}

export function removeStorage(key: string) {
  try { Taro.removeStorageSync(key) } catch {}
}

// 防抖
export function debounce<T extends (...args: any[]) => any>(fn: T, wait = 300) {
  let timer: any
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

// 节流
export function throttle<T extends (...args: any[]) => any>(fn: T, wait = 300) {
  let last = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= wait) { last = now; fn(...args) }
  }
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// 获取当前环境
export function getPlatform(): string {
  // eslint-disable-next-line no-undef
  return process.env.TARO_ENV || 'weapp'
}
