<template>
  <div class="auth-page">
    <div class="bg" :style="bgStyle">
      <ParticleBg :count="80" :color="particleColor" />
    </div>
    <div class="card">
      <div class="top-actions">
        <router-link to="/" class="site-title">
          <span class="title-text">我的发布站</span>
        </router-link>
        <button class="theme-toggle" @click="toggleBg">
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"/>
          </svg>
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switcher" v-if="!isForgotPassword">
        <button
          :class="['tab-btn', { active: mode === 'login' }]"
          @click="switchMode('login')"
        >
          登录
        </button>
        <button
          :class="['tab-btn', { active: mode === 'register' }]"
          @click="switchMode('register')"
        >
          注册
        </button>
      </div>

      <h2>{{ pageTitle }}</h2>

      <!-- Login Form -->
      <form v-if="mode === 'login' && !isForgotPassword" @submit.prevent="onLogin" class="auth-form">
        <div class="field">
          <label>邮箱或用户名</label>
          <input v-model.trim="loginForm.email" type="text" placeholder="请输入邮箱或用户名" required />
        </div>
        <div class="field">
          <label>密码</label>
          <input v-model="loginForm.password" type="password" placeholder="请输入密码" required />
        </div>
        <div class="field-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="loginForm.rememberMe" />
            <span>记住我</span>
          </label>
          <a href="#" @click.prevent="isForgotPassword = true" class="forgot-link">忘记密码？</a>
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <!-- Register Form -->
      <form v-if="mode === 'register' && !isForgotPassword" @submit.prevent="onRegister" class="auth-form">
        <div class="field">
          <label>用户名</label>
          <input v-model.trim="registerForm.username" type="text" placeholder="请输入用户名" required />
        </div>
        <div class="field">
          <label>邮箱</label>
          <input v-model.trim="registerForm.email" type="email" placeholder="请输入邮箱" required />
        </div>
        <div class="field">
          <label>密码</label>
          <input v-model="registerForm.password" type="password" placeholder="至少6位密码" minlength="6" required />
        </div>
        <div class="field">
          <label>确认密码</label>
          <input v-model="registerForm.confirm" type="password" placeholder="再次输入密码" minlength="6" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <!-- Forgot Password Form -->
      <form v-if="isForgotPassword" @submit.prevent="onResetPassword" class="auth-form">
        <div class="field">
          <label>用户名</label>
          <input v-model.trim="resetForm.username" type="text" placeholder="请输入用户名" required />
        </div>
        <div class="field">
          <label>邮箱</label>
          <input v-model.trim="resetForm.email" type="email" placeholder="请输入邮箱" required />
        </div>
        <div class="field">
          <label>新密码</label>
          <input v-model="resetForm.newPassword" type="password" placeholder="至少6位新密码" minlength="6" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '重置中...' : '重置密码' }}
          </button>
          <a href="#" @click.prevent="isForgotPassword = false" class="back-link">返回登录</a>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { login, register, resetPassword } from '../api'
import { useAuthStore } from '../stores/auth'
import ParticleBg from '../components/ParticleBg.vue'

export default {
  name: 'Auth',
  components: { ParticleBg },
  data() {
    return {
      mode: 'login', // 'login' or 'register'
      isForgotPassword: false,
      loginForm: { email: '', password: '', rememberMe: false },
      registerForm: { username: '', email: '', password: '', confirm: '' },
      resetForm: { username: '', email: '', newPassword: '' },
      loading: false,
      error: ''
    }
  },
  computed: {
    pageTitle() {
      if (this.isForgotPassword) return '忘记密码'
      return this.mode === 'login' ? '欢迎登录' : '注册账号'
    }
  },
  mounted() {
    // 从路由判断模式
    if (this.$route.path === '/register') {
      this.mode = 'register'
    } else {
      this.mode = 'login'
    }

    // 检查是否需要显示忘记密码
    const showForgotPassword = sessionStorage.getItem('showForgotPassword')
    if (showForgotPassword === 'true') {
      this.isForgotPassword = true
      this.mode = 'login'
      sessionStorage.removeItem('showForgotPassword')
    }

    // 读取表单数据
    if (this.mode === 'login') {
      const loginData = sessionStorage.getItem('loginFormData')
      if (loginData) {
        try {
          const formData = JSON.parse(loginData)
          if (formData.email) this.loginForm.email = formData.email
          if (formData.password) this.loginForm.password = formData.password
          if (formData.rememberMe) this.loginForm.rememberMe = formData.rememberMe
          sessionStorage.removeItem('loginFormData')
        } catch (e) {
          console.error('Failed to parse login form data:', e)
        }
      }
    } else if (this.mode === 'register') {
      const registerData = sessionStorage.getItem('registerFormData')
      if (registerData) {
        try {
          const formData = JSON.parse(registerData)
          if (formData.username) this.registerForm.username = formData.username
          if (formData.email) this.registerForm.email = formData.email
          if (formData.password) this.registerForm.password = formData.password
          sessionStorage.removeItem('registerFormData')
        } catch (e) {
          console.error('Failed to parse register form data:', e)
        }
      }
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
    switchMode(newMode) {
      this.mode = newMode
      this.error = ''
      this.isForgotPassword = false
    },
    async onLogin() {
      this.error = ''
      const { email, password } = this.loginForm
      if (!email || !password) {
        this.error = '请输入邮箱/用户名和密码'
        return
      }
      this.loading = true
      try {
        const res = await login({ email, password })
        const token = res.data.token
        const user = res.data.user
        // Always use localStorage so tokens are accessible across tabs
        // Token has 7-day expiration, so it will auto-expire even if user doesn't check "remember me"
        localStorage.setItem('token', token)
        // Also store rememberMe preference for future reference
        if (this.loginForm.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        } else {
          localStorage.removeItem('rememberMe')
        }
        const authStore = useAuthStore()
        authStore.setUser(user)
        // 检查是否有重定向路径
        const redirectPath = sessionStorage.getItem('redirectAfterLogin')
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin')
          this.$router.push(redirectPath)
        } else {
          this.$router.push('/')
        }
      } catch (e) {
        this.error = e.response?.data?.error || '登录失败'
      } finally {
        this.loading = false
      }
    },
    async onRegister() {
      this.error = ''
      const { username, email, password, confirm } = this.registerForm
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
        // 检查是否有重定向路径
        const redirectPath = sessionStorage.getItem('redirectAfterRegister')
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterRegister')
          this.$router.push(redirectPath)
        } else {
          this.$router.push('/')
        }
      } catch (e) {
        this.error = e.response?.data?.error || '注册失败'
      } finally {
        this.loading = false
      }
    },
    async onResetPassword() {
      this.error = ''
      const { username, email, newPassword } = this.resetForm
      if (!username || !email || !newPassword) {
        this.error = '请完整填写信息'
        return
      }
      if (newPassword.length < 6) {
        this.error = '新密码至少需要6位字符'
        return
      }
      this.loading = true
      try {
        await resetPassword({ username, email, newPassword })
        alert('密码重置成功！请使用新密码登录')
        this.isForgotPassword = false
        this.resetForm = { username: '', email: '', newPassword: '' }
      } catch (e) {
        this.error = e.response?.data?.error || '密码重置失败，请重试'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 24px;
}

.bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #67b5ff 0%, #ffffff 40%, #000000 100%);
}

.card {
  position: relative;
  width: min(440px, 92vw);
  padding: 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  color: #fff;
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.site-title {
  text-decoration: none;
  transition: all 0.3s;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.site-title:hover .title-text {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.tab-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin: 0 0 28px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.field input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.field input:focus {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.field-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  margin-bottom: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.forgot-link,
.back-link {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s;
}

.forgot-link:hover,
.back-link:hover {
  color: #fff;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #42b983 0%, #35a372 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #35a372 0%, #2d8f5f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(66, 185, 131, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error {
  color: #ffe0e0;
  background: rgba(255, 0, 0, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid rgba(255, 0, 0, 0.2);
}
</style>

