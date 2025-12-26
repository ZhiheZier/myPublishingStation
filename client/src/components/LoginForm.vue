<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ isLogin ? '请登录' : '注册' }}
    </h3>

    <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-if="!isLogin">
        <input
          type="text"
          v-model="username"
          placeholder="用户名"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          required
        />
      </div>

      <div>
        <input
          type="email"
          v-model="email"
          placeholder="邮箱"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          required
        />
      </div>

      <div>
        <input
          type="password"
          v-model="password"
          placeholder="密码"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          required
        />
      </div>

      <div v-if="isLogin" class="flex items-center justify-between text-sm">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="rememberMe"
            class="mr-2"
          />
          记住我
        </label>
        <a href="#" class="text-primary-600 hover:text-primary-700">
          忘记密码？
        </a>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {{ loading ? '处理中...' : isLogin ? '登录' : '注册' }}
      </button>

      <div class="text-center">
        <button
          type="button"
          @click="toggleMode"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          {{ isLogin ? '还没有账号？注册' : '已有账号？登录' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login, register } from '../api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const isLogin = ref(true)
const email = ref('')
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')
const loading = ref(false)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    let response
    if (isLogin.value) {
      response = await login({ email: email.value, password: password.value })
    } else {
      if (!username.value) {
        error.value = '请输入用户名'
        loading.value = false
        return
      }
      response = await register({ username: username.value, email: email.value, password: password.value })
    }

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
  } catch (err) {
    error.value = err.response?.data?.error || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
