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

  // Remove preloader with fade-out
  const loader = document.getElementById('loading-wrapper');
  if (loader) {
    loader.style.transition = 'opacity 0.5s ease';
    // Small delay to ensure render
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 500); // Wait for transition
    }, 500); // Minimum visibility time
  }
})
</script>

<template>
  <RouterView />
</template>