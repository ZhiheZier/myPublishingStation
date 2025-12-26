<template>
  <div>
    <!-- Users List -->
    <div v-if="users.length > 0" class="space-y-4">
      <div
        v-for="user in users"
        :key="user.id"
        class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4 flex-1">
            <!-- Avatar -->
            <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-300 flex-shrink-0">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <svg
                v-else
                class="w-8 h-8 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            
            <!-- User Info -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-lg font-bold text-gray-900">{{ user.username }}</h3>
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'"
                >
                  {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">{{ user.email }}</p>
              <p class="text-xs text-gray-500">注册时间：{{ formatDate(user.created_at) }}</p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center gap-2 ml-4">
            <!-- Role Toggle -->
            <button
              @click="handleToggleRole(user)"
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              {{ user.role === 'admin' ? '设为用户' : '设为管理员' }}
            </button>
            
            <!-- Delete Button -->
            <button
              v-if="user.id !== currentUserId"
              @click="handleDelete(user.id)"
              class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white/90 backdrop-blur-sm rounded-lg">
      <p class="text-gray-500 text-lg">暂无用户</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllUsers, updateUserRole, deleteUser } from '../../api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(true)
const currentUserId = ref(null)

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

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getAllUsers()
    users.value = res.data
    currentUserId.value = authStore.user?.id
  } catch (err) {
    console.error('Failed to load users:', err)
    alert('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleToggleRole = async (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const confirmMessage = `确定要将 ${user.username} ${newRole === 'admin' ? '设为管理员' : '设为普通用户'} 吗？`
  
  if (!confirm(confirmMessage)) {
    return
  }

  try {
    await updateUserRole(user.id, newRole)
    await loadUsers()
    alert('角色修改成功')
  } catch (err) {
    console.error('Failed to update user role:', err)
    alert(err.response?.data?.error || '修改失败，请重试')
  }
}

const handleDelete = async (userId) => {
  const user = users.value.find(u => u.id === userId)
  if (!confirm(`确定要删除用户 ${user?.username} 吗？此操作不可恢复！`)) {
    return
  }

  try {
    await deleteUser(userId)
    await loadUsers()
    alert('用户删除成功')
  } catch (err) {
    console.error('Failed to delete user:', err)
    alert(err.response?.data?.error || '删除失败，请重试')
  }
}

defineExpose({
  loadUsers
})

onMounted(() => {
  loadUsers()
})
</script>

