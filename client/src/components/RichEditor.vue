<template>
  <div class="rich-editor">
    <QuillEditor
      v-model:content="content"
      contentType="html"
      :options="editorOptions"
      @update:content="handleContentChange"
      style="height: 500px;"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const content = ref(props.modelValue)

const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  },
  placeholder: '开始编写你的文章内容...',
  theme: 'snow'
}

const handleContentChange = (newContent) => {
  emit('update:modelValue', newContent)
}

watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})
</script>

<style scoped>
.rich-editor {
  background: white;
  border-radius: 8px;
}

:deep(.ql-container) {
  min-height: 400px;
  font-size: 16px;
}

:deep(.ql-editor) {
  min-height: 400px;
  color: #111827; /* text-gray-900 */
}

:deep(.ql-toolbar) {
  background: #f8f9fa;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
</style>

