<template>
  <div class="bg-white/30 rounded shadow-lg p-4 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget">
    <h3 class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-3 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="isForgotPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        <path v-else-if="isLogin" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      {{ isForgotPassword ? '忘记密码' : isLogin ? '请登录' : '注册' }}
    </h3>

    <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Username (for register and forgot password) -->
      <div v-if="!isLogin || isForgotPassword">
        <input
          type="text"
          v-model="username"
          placeholder="用户名"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          required
        />
      </div>

      <!-- Email -->
      <div>
        <input
          type="email"
          v-model="email"
          placeholder="邮箱"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          required
        />
      </div>

      <!-- Password (for login and register) -->
      <div v-if="!isForgotPassword">
        <input
          type="password"
          v-model="password"
          placeholder="密码"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          required
        />
      </div>

      <!-- New Password (for forgot password) -->
      <div v-if="isForgotPassword">
        <input
          type="password"
          v-model="newPassword"
          placeholder="新密码"
          minlength="6"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          required
        />
      </div>

      <!-- Remember me and Forgot password link (only for login) -->
      <div v-if="isLogin && !isForgotPassword" class="flex items-center justify-between text-sm">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="rememberMe"
            class="mr-2"
          />
          记住我
        </label>
        <button
          type="button"
          @click="switchToForgotPassword"
          class="text-primary-600 hover:text-primary-700"
        >
          忘记密码？
        </button>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {{ loading ? '处理中...' : isForgotPassword ? '重置密码' : isLogin ? '登录' : '注册' }}
      </button>

      <div class="text-center mt-2">
        <button
          type="button"
          @click="toggleMode"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          {{ isForgotPassword ? '返回登录' : isLogin ? '还没有账号？注册' : '已有账号？登录' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login, register, resetPassword } from '../api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const isLogin = ref(true)
const isForgotPassword = ref(false)
const email = ref('')
const username = ref('')
const password = ref('')
const newPassword = ref('')
const rememberMe = ref(false)
const error = ref('')
const loading = ref(false)

const switchToForgotPassword = () => {
  isForgotPassword.value = true
  isLogin.value = false
  error.value = ''
  password.value = ''
}

const toggleMode = () => {
  if (isForgotPassword.value) {
    // From forgot password back to login
    isForgotPassword.value = false
    isLogin.value = true
  } else {
    // Toggle between login and register
    isLogin.value = !isLogin.value
  }
  error.value = ''
  // Reset form fields
  username.value = ''
  password.value = ''
  newPassword.value = ''
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    if (isForgotPassword.value) {
      // Reset password
      if (!username.value) {
        error.value = '请输入用户名'
        loading.value = false
        return
      }
      if (!newPassword.value || newPassword.value.length < 6) {
        error.value = '新密码至少需要6位字符'
        loading.value = false
        return
      }
      await resetPassword({
        username: username.value,
        email: email.value,
        newPassword: newPassword.value
      })
      alert('密码重置成功！请使用新密码登录')
      // Switch back to login
      isForgotPassword.value = false
      isLogin.value = true
      username.value = ''
      email.value = ''
      newPassword.value = ''
    } else if (isLogin.value) {
      // Login
      const response = await login({ email: email.value, password: password.value })
      // Save token
      if (rememberMe.value) {
        localStorage.setItem('token', response.data.token)
      } else {
        sessionStorage.setItem('token', response.data.token)
      }
      // Update auth store
      authStore.setUser(response.data.user)
      // Reset form
      email.value = ''
      password.value = ''
    } else {
      // Register
      if (!username.value) {
        error.value = '请输入用户名'
        loading.value = false
        return
      }
      const response = await register({ username: username.value, email: email.value, password: password.value })
      // Save token
      if (rememberMe.value) {
        localStorage.setItem('token', response.data.token)
      } else {
        sessionStorage.setItem('token', response.data.token)
      }
      // Update auth store
      authStore.setUser(response.data.user)
      // Reset form
      email.value = ''
      password.value = ''
      username.value = ''
    }
  } catch (err) {
    error.value = err.response?.data?.error || (isForgotPassword.value ? '密码重置失败，请重试' : isLogin.value ? '登录失败，请重试' : '注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.sidebar-widget {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.sidebar-widget:hover {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
}
</style>
