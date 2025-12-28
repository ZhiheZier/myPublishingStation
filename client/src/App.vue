<template>
  <Layout>
    <router-view :key="$route.fullPath" />
  </Layout>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import Layout from './components/Layout.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Initialize auth store before component mounts to ensure user state is available
onBeforeMount(async () => {
  if (authStore.loading) {
    await authStore.init()
  }
})
</script>
