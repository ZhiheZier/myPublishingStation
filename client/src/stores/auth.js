import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCurrentUser } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const init = async () => {
    // Prevent multiple simultaneous initializations
    if (!loading.value && user.value) {
      return
    }
    
    loading.value = true
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    if (token) {
      try {
        const res = await getCurrentUser()
        user.value = res.data
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        user.value = null
      }
    } else {
      user.value = null
    }
    loading.value = false
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    user.value = null
  }

  return {
    user,
    loading,
    init,
    setUser,
    logout
  }
})
