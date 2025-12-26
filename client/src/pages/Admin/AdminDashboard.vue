<template>
  <div>
    <!-- Header with Tabs -->
    <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">管理后台</h1>
        <router-link
          v-if="activeTab === 'posts'"
          to="/admin/post/new"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          创建新文章
        </router-link>
      </div>
      
      <!-- Tabs -->
      <div class="flex items-center gap-2 border-b border-gray-200">
        <button
          @click="activeTab = 'posts'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'posts'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          文章管理
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'users'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          用户管理
        </button>
        <button
          @click="activeTab = 'profile'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'profile'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          个人信息
        </button>
      </div>
    </div>

    <!-- Posts Management -->
    <div v-if="activeTab === 'posts'">
    <!-- Posts List -->
    <div v-if="posts.length > 0" class="space-y-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900 mb-2">
              <router-link
                :to="`/post/${post.id}`"
                class="hover:text-primary-600 transition-colors"
              >
                {{ post.title }}
              </router-link>
            </h2>
            <div class="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
              <span>{{ formatDate(post.created_at) }}</span>
              <div v-if="post.tags && post.tags.length > 0" class="flex items-center gap-2 flex-wrap">
                <span
                  v-for="tag in post.tags"
                  :key="tag.id || tag.name"
                  class="px-2 py-1 bg-gray-100 rounded text-xs"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <router-link
              :to="{ name: 'PostEdit', params: { id: post.id } }"
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              编辑
            </router-link>
            <button
              @click="handleDelete(post.id)"
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
      <p class="text-gray-500 text-lg">暂无文章</p>
    </div>
    </div>

    <!-- Users Management -->
    <UserManagement v-else-if="activeTab === 'users'" ref="userManagementRef" />

    <!-- Profile Management -->
    <AdminProfile v-else-if="activeTab === 'profile'" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, deletePost } from '../../api'
import UserManagement from '../../components/Admin/UserManagement.vue'
import AdminProfile from '../../components/Admin/AdminProfile.vue'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const activeTab = ref('posts')
const userManagementRef = ref(null)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await getPosts({ page: 1, limit: 100 })
    posts.value = res.data.posts || res.data
  } catch (err) {
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这篇文章吗？')) {
    return
  }

  try {
    await deletePost(id)
    await loadPosts()
  } catch (err) {
    console.error('Failed to delete post:', err)
    alert(err.response?.data?.error || '删除失败，请重试')
  }
}

onMounted(() => {
  loadPosts()
})
</script>
