<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // CORRECCIÓN IMPORTANTE:
  // Detectamos '/callback' para NO ejecutar checkAuth() en ese momento.
  // Si ejecutamos checkAuth() durante el callback, puede fallar porque el token aún no se ha guardado.
  const isCallbackRoute = window.location.pathname.startsWith('/callback');

  if (!isCallbackRoute) {
      await authStore.checkAuth() 
  }
})
</script>

<template>
  <RouterView />
</template>