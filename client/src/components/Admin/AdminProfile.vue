<template>
  <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-6">个人信息管理</h2>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <div v-else class="grid grid-cols-2 gap-6">
      <!-- Left: Profile Info -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Avatar -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">头像</label>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="hidden"
          />
          <button
            type="button"
            @click="fileInputRef?.click()"
            class="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-300 hover:bg-gray-400 transition-colors cursor-pointer border-2 border-dashed border-gray-400 hover:border-gray-500"
          >
            <img
              v-if="formData.avatar"
              :src="formData.avatar"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
            <svg
              v-else
              class="w-10 h-10 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Username -->
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            用户名 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.username"
            type="text"
            required
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="请输入用户名"
          />
        </div>

        <!-- Email (Read-only) -->
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
          <input
            :value="userProfile.email"
            type="email"
            disabled
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <!-- Role and Registration Date in one row -->
        <div class="grid grid-cols-2 gap-4 max-w-xs">
          <!-- Role (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
            <div class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100">
              <span class="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                {{ userProfile.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </div>
          </div>

          <!-- Registration Date (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">注册时间</label>
            <div class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
              {{ formatDate(userProfile.created_at) }}
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div>
          <button
            type="submit"
            :disabled="profileLoading"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ profileLoading ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>

      <!-- Right: Change Password Section -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 mb-4">修改密码</h2>
        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              当前密码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入当前密码"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              新密码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
              minlength="6"
              class="w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入新密码（至少6位）"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              确认新密码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              class="w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请再次输入新密码"
            />
          </div>

          <div>
            <button
              type="submit"
              :disabled="passwordLoading"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ passwordLoading ? '修改中...' : '修改密码' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserProfile, updateUserProfile, changePassword } from '../../api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const profileLoading = ref(false)
const passwordLoading = ref(false)
const fileInputRef = ref(null)
const userProfile = ref({
  username: '',
  email: '',
  avatar: '',
  role: '',
  created_at: ''
})

const formData = ref({
  username: '',
  avatar: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // Convert to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target.result
  }
  reader.onerror = () => {
    alert('图片读取失败，请重试')
  }
  reader.readAsDataURL(file)
}

const loadProfile = async () => {
  loading.value = true
  try {
    const res = await getUserProfile()
    userProfile.value = res.data
    formData.value = {
      username: res.data.username || '',
      avatar: res.data.avatar || ''
    }
  } catch (err) {
    console.error('Failed to load profile:', err)
    alert('加载个人信息失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  profileLoading.value = true
  try {
    await updateUserProfile({
      username: formData.value.username,
      avatar: formData.value.avatar
    })
    
    // Update auth store
    authStore.setUser({
      ...authStore.user,
      username: formData.value.username,
      avatar: formData.value.avatar
    })
    
    userProfile.value.username = formData.value.username
    userProfile.value.avatar = formData.value.avatar
    
    alert('个人信息更新成功！')
  } catch (err) {
    console.error('Failed to update profile:', err)
    alert(err.response?.data?.error || '更新失败，请重试')
  } finally {
    profileLoading.value = false
  }
}

const handlePasswordChange = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    alert('新密码至少需要6位字符')
    return
  }

  passwordLoading.value = true
  try {
    await changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    alert('密码修改成功！')
  } catch (err) {
    console.error('Failed to change password:', err)
    alert(err.response?.data?.error || '密码修改失败，请重试')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  await loadProfile()
})
</script>

