<template>
  <div class="auth-page">
    <div class="bg" :style="bgStyle">
      <ParticleBg :count="80" :color="particleColor" />
    </div>
    <div class="card">
      <div class="top-actions">
        <button class="theme-toggle" @click="toggleBg">
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"/></svg>
        </button>
      </div>
      <h2>注册账号</h2>
      <form @submit.prevent="onSubmit">
        <div class="field">
          <label>用户名</label>
          <input v-model.trim="form.username" type="text" placeholder="请输入用户名" />
        </div>
        <div class="field">
          <label>邮箱</label>
          <input v-model.trim="form.email" type="email" placeholder="请输入邮箱" />
        </div>
        <div class="field">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="至少6位密码" />
        </div>
        <div class="field">
          <label>确认密码</label>
          <input v-model="form.confirm" type="password" placeholder="再次输入密码" />
        </div>
        <div class="actions">
          <button type="submit" :disabled="loading">注册</button>
          <router-link to="/login">登录</router-link>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
    </template>

<script>
import { ref, computed } from 'vue'
import { register } from '../api'
import { useAuthStore } from '../stores/auth'
import ParticleBg from '../components/ParticleBg.vue'

export default {
  name: 'AuthRegister',
  components: { ParticleBg },
  data() {
    return {
      form: { username: '', email: '', password: '', confirm: '' },
      loading: false,
      error: ''
    }
  },
  setup() {
    const isDark = ref(localStorage.getItem('auth_bg_mode') === 'dark')
    const bgStyle = computed(() => ({
      background: isDark.value
        ? 'linear-gradient(135deg, #0f172a 0%, #1f2937 50%, #334155 100%)'
        : 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 40%, #6a82fb 100%)'
    }))
    const particleColor = computed(() => (isDark.value ? '200,200,255' : '255,255,255'))
    const toggleBg = () => {
      isDark.value = !isDark.value
      localStorage.setItem('auth_bg_mode', isDark.value ? 'dark' : 'light')
    }
    return { isDark, bgStyle, particleColor, toggleBg }
  },
  methods: {
    async onSubmit() {
      this.error = ''
      const { username, email, password, confirm } = this.form
      if (!username || !email || !password || !confirm) {
        this.error = '请完整填写信息'
        return
      }
      if (password.length < 6) {
        this.error = '密码至少6位'
        return
      }
      if (password !== confirm) {
        this.error = '两次密码不一致'
        return
      }
      this.loading = true
      try {
        const res = await register({ username, email, password })
        const token = res.data.token
        const user = res.data.user
        localStorage.setItem('token', token)
        const authStore = useAuthStore()
        authStore.setUser(user)
        this.$router.push('/')
      } catch (e) {
        this.error = e.response?.data?.error || '注册失败'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 24px; }
.bg { position: absolute; inset: 0; background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 40%, #6a82fb 100%); }
.card { position: relative; width: min(420px, 92vw); padding: 28px; border-radius: 16px; background: rgba(255,255,255,0.18); box-shadow: 0 10px 30px rgba(0,0,0,0.15); backdrop-filter: blur(10px); color: #fff; }
.card h2 { margin: 0 0 12px; text-align: center; }
.top-actions { display: flex; justify-content: flex-end; margin-bottom: 6px; }
.theme-toggle { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.25); color: #fff; }
.field { margin-bottom: 12px; text-align: left; }
label { display: block; margin-bottom: 6px; font-weight: 600; }
input { width: 100%; max-width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid rgba(255,255,255,0.35); border-radius: 8px; background: rgba(255,255,255,0.25); color: #fff; outline: none; }
input::placeholder { color: rgba(255,255,255,0.8); }
.actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
button { flex: 1; padding: 10px 14px; background: #42b983; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
button[disabled] { opacity: 0.6; cursor: not-allowed; }
.actions a { color: #fff; opacity: 0.9; }
.error { color: #ffe0e0; margin-top: 10px; }
</style>
