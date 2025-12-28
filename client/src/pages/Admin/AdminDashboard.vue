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
          @click="activeTab = 'announcement'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'announcement'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          公告栏管理
        </button>
        <button
          @click="activeTab = 'qa'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'qa'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          问答专区管理
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
    <!-- Search Bar -->
    <div class="mb-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4">
      <div class="flex items-center gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章标题或内容..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
          @keydown.enter="handleSearch"
        />
        <button
          @click="handleSearch"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          搜索
        </button>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          清除
        </button>
      </div>
    </div>
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
      <p class="text-gray-500 text-lg">{{ searchQuery ? '未找到相关文章' : '暂无文章' }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="page = Math.max(1, page - 1); loadPosts()"
        :disabled="page === 1"
        :class="[
          'px-3 py-1 rounded transition-colors text-sm text-black border border-black',
          page === 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-primary-600 hover:text-white hover:border-primary-600'
        ]"
      >
        <<
      </button>
      
      <div class="flex items-center gap-1">
        <template v-for="pageNum in visiblePages" :key="pageNum">
          <span v-if="pageNum === '...'" class="px-2 text-gray-500">...</span>
          <button
            v-else
            @click="page = pageNum; loadPosts()"
            :class="[
              'px-3 py-1 rounded transition-colors text-sm text-black',
              page === pageNum
                ? 'bg-primary-600 text-white border border-primary-600'
                : 'border border-black hover:bg-primary-600 hover:text-white hover:border-primary-600'
            ]"
          >
            {{ pageNum }}
          </button>
        </template>
      </div>
      
      <button
        @click="page = Math.min(totalPages, page + 1); loadPosts()"
        :disabled="page === totalPages"
        :class="[
          'px-3 py-1 rounded transition-colors text-sm text-black border border-black',
          page === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-primary-600 hover:text-white hover:border-primary-600'
        ]"
      >
        >>
      </button>
    </div>
    </div>

    <!-- Users Management -->
    <UserManagement v-else-if="activeTab === 'users'" ref="userManagementRef" />

    <!-- Announcement Management -->
    <div v-else-if="activeTab === 'announcement'" class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">编辑公告栏</h2>
      <div v-if="announcementLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">公告内容</label>
          <textarea
            v-model="announcementContent"
            rows="10"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            placeholder="请输入公告内容（支持HTML格式）"
          ></textarea>
        </div>
        <div class="flex items-center justify-end gap-4">
          <button
            @click="handleSaveAnnouncement"
            :disabled="announcementSaving"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ announcementSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Q&A Management -->
    <div v-else-if="activeTab === 'qa'" class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">编辑问答专区</h2>
      <div v-if="qaLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
          <input
            v-model="qaTitle"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            placeholder="请输入问答专区标题"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
          <RichEditor v-model="qaContent" />
        </div>
        <div class="flex items-center justify-end gap-4">
          <button
            @click="handleSaveQa"
            :disabled="qaSaving"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ qaSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Management -->
    <AdminProfile v-else-if="activeTab === 'profile'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, deletePost, getAnnouncement, updateAnnouncement, getQa, updateQa } from '../../api'
import UserManagement from '../../components/Admin/UserManagement.vue'
import AdminProfile from '../../components/Admin/AdminProfile.vue'
import RichEditor from '../../components/RichEditor.vue'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const activeTab = ref('posts')
const userManagementRef = ref(null)
const announcementContent = ref('')
const announcementLoading = ref(false)
const announcementSaving = ref(false)
const qaTitle = ref('')
const qaContent = ref('')
const qaLoading = ref(false)
const qaSaving = ref(false)
const searchQuery = ref('')
const page = ref(1)
const total = ref(0)
const limit = 10

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  return `${dateStr} ${timeStr}`
}

const totalPages = computed(() => Math.ceil(total.value / limit))

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 10
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    if (page.value <= 5) {
      for (let i = 1; i <= 9; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages.value)
    } else if (page.value >= totalPages.value - 4) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages.value - 8; i <= totalPages.value; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = page.value - 4; i <= page.value + 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages.value)
    }
  }
  
  return pages
})

const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: limit
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const res = await getPosts(params)
    posts.value = res.data.posts || res.data
    total.value = res.data.total || 0
  } catch (err) {
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    page.value = 1
    loadPosts()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  page.value = 1
  loadPosts()
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

const loadAnnouncement = async () => {
  announcementLoading.value = true
  try {
    const res = await getAnnouncement()
    announcementContent.value = res.data.content || ''
  } catch (err) {
    console.error('Failed to load announcement:', err)
    alert(err.response?.data?.error || '加载公告栏失败')
  } finally {
    announcementLoading.value = false
  }
}

const handleSaveAnnouncement = async () => {
  announcementSaving.value = true
  try {
    await updateAnnouncement(announcementContent.value)
    alert('公告栏更新成功！')
  } catch (err) {
    console.error('Failed to save announcement:', err)
    alert(err.response?.data?.error || '保存失败，请重试')
  } finally {
    announcementSaving.value = false
  }
}

// Watch for page changes to reload posts
watch(page, () => {
  if (activeTab.value === 'posts') {
    loadPosts()
  }
})

const loadQa = async () => {
  qaLoading.value = true
  try {
    const res = await getQa()
    if (res.data && res.data.id) {
      qaTitle.value = res.data.title || ''
      qaContent.value = res.data.content || ''
    } else {
      qaTitle.value = ''
      qaContent.value = ''
    }
  } catch (err) {
    console.error('Failed to load Q&A:', err)
  } finally {
    qaLoading.value = false
  }
}

const handleSaveQa = async () => {
  if (!qaTitle.value.trim() || !qaContent.value.trim()) {
    alert('标题和内容不能为空')
    return
  }
  
  qaSaving.value = true
  try {
    await updateQa(qaTitle.value.trim(), qaContent.value.trim())
    alert('保存成功')
  } catch (err) {
    console.error('Failed to save Q&A:', err)
    alert(err.response?.data?.error || '保存失败，请重试')
  } finally {
    qaSaving.value = false
  }
}

// Watch for tab changes to load announcement when needed
watch(activeTab, (newTab) => {
  if (newTab === 'announcement') {
    loadAnnouncement()
  } else if (newTab === 'qa') {
    loadQa()
  } else if (newTab === 'posts') {
    // Reload posts when switching back to posts tab
    loadPosts()
  }
})

onMounted(() => {
  loadPosts()
  if (activeTab.value === 'announcement') {
    loadAnnouncement()
  } else if (activeTab.value === 'qa') {
    loadQa()
  }
})
</script>
