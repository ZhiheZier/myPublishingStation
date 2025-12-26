<template>
  <div class="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEdit ? '编辑文章' : '创建新文章' }}
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          标题 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.title"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="请输入文章标题"
        />
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          标签
        </label>
        <div class="flex gap-2 mb-2">
          <input
            v-model="newTag"
            @keydown.enter.prevent="addTag"
            type="text"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="输入标签后按回车添加"
          />
          <button
            type="button"
            @click="addTag"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            添加
          </button>
        </div>
        <div v-if="formData.tags && formData.tags.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="(tag, index) in formData.tags"
            :key="index"
            class="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(index)"
              class="ml-2 text-primary-600 hover:text-primary-800"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- Content -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          内容 <span class="text-red-500">*</span>
        </label>
        <RichEditor v-model="formData.content" />
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-4 pt-4 border-t">
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '保存中...' : '保存文章' }}
        </button>
        <router-link
          to="/admin"
          class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          取消
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, createPost, updatePost } from '../../api'
import RichEditor from '../../components/RichEditor.vue'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const loading = ref(false)
const newTag = ref('')

const formData = ref({
  title: '',
  content: '',
  tags: []
})

// Extract first image from HTML content
const extractFirstImage = (htmlContent) => {
  if (!htmlContent) return ''
  
  // Match <img> tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i
  const match = htmlContent.match(imgRegex)
  
  if (match && match[1]) {
    return match[1]
  }
  
  return ''
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  formData.value.tags.splice(index, 1)
}

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    try {
      const res = await getPost(route.params.id)
      formData.value = {
        title: res.data.title || '',
        content: res.data.content || '',
        tags: res.data.tags ? res.data.tags.map(t => t.name) : []
      }
    } catch (err) {
      console.error('Failed to load post:', err)
      router.push('/admin')
    }
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // Extract first image from content as cover image
    const coverImage = extractFirstImage(formData.value.content)
    
    const postData = {
      ...formData.value,
      cover_image: coverImage
    }
    
    if (isEdit.value) {
      await updatePost(route.params.id, postData)
    } else {
      await createPost(postData)
    }
    router.push('/admin')
  } catch (err) {
    console.error('Failed to save post:', err)
    alert(err.response?.data?.error || '保存失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
