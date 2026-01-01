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
  // Check if we need to initialize (loading or have token but no user)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (authStore.loading || (token && !authStore.user)) {
    await authStore.init()
  }
})
</script>
