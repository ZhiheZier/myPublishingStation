<template>
  <Layout>
    <router-view :key="$route.fullPath" />
  </Layout>
</template>

<script setup>
import { onMounted } from 'vue'
import Layout from './components/Layout.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
</script>
