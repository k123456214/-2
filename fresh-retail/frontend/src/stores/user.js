import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '../api'
import router from '../router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || user.value?.username || '')
  const userRole = computed(() => user.value?.role || '')

  function setLogin(data) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  async function fetchProfile() {
    try {
      const res = await auth.getProfile()
      user.value = res.data || res
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    userName,
    userRole,
    setLogin,
    logout,
    fetchProfile,
  }
})
