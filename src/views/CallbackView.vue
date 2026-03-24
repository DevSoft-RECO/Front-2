<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref('Validando acceso institucional')
const subStatus = ref(
  'Estamos verificando tu identidad con los sistemas de la Cooperativa YAMAN KUTX.'
)

// Variable bloqueadora para evitar re-ejecuciones paralelas (doble montaje)
let isProcessingCallback = false;

onMounted(async () => {
  if (isProcessingCallback) {
      console.warn("Callback ya en proceso, ignorando peticiones repetidas.");
      return;
  }
  isProcessingCallback = true;

  // ADAPTACIÓN: Capturamos el code de autorización para PKCE
  const code = route.query.code

  if (!code) {
    status.value = 'Autenticación no válida'
    subStatus.value =
      'No se recibió el código de autorización necesario para validar la sesión.'
    return
  }

  // Limpiar URL para seguridad y estética
  window.history.replaceState({}, document.title, window.location.pathname)

  try {
    status.value = 'Intercambiando credenciales...'
    subStatus.value = 'Validando acceso con YAMAN KUTX.'

    // 2. Procesar el intercambio de código en el store
    await authStore.handlePKCECallback(code)

    status.value = 'Acceso autorizado'
    subStatus.value =
      'Bienvenido a los sistemas internos de la Cooperativa YAMAN KUTX.'

    // Redirección Dinámica: Volver a donde el usuario intentaba entrar
    const redirectUrl = sessionStorage.getItem('auth_redirect_to') || { name: 'dashboard' };
    if (sessionStorage.getItem('auth_redirect_to')) {
       sessionStorage.removeItem('auth_redirect_to');
    }

    setTimeout(() => {
      router.push(redirectUrl)
    }, 900)

  } catch (e) {
    console.error("Detalle del error:", e)
    status.value = 'Error de autenticación'
    subStatus.value = `Error: ${e.response?.data?.message || e.message || 'Desconocido'}. Revisa la consola para más detalles.`
  }
})
</script>
<template>
  <div
    class="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gray-50 dark:bg-[#050B14]"
  >

    <!-- Glassmorphism Card -->
    <div
      class="relative z-10 w-full max-w-md rounded-3xl bg-white/70 dark:bg-gray-900/60
             backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-gray-700/50
             p-10 text-center space-y-8 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(31,175,139,0.15)]"
    >
      <!-- Marca con efecto Glow -->
      <div class="space-y-3 relative">
        <div class="absolute inset-0 bg-[#1FAF8B]/10 blur-xl rounded-full scale-110"></div>
        <div class="relative flex justify-center transform transition-transform duration-[2000ms] hover:scale-105">
          <img src="@/assets/logoyk.svg" alt="Logo Yaman Kutx" class="h-16 w-auto drop-shadow-md" />
        </div>

        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0B3C5D] to-[#1FAF8B] dark:from-white dark:to-[#1FAF8B]">
          Cooperativa YAMAN KUTX
        </h1>
        <p class="text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400 font-semibold">
          Plataforma Corporativa
        </p>
      </div>

      <!-- Loader Premium (Progressive Bar) -->
      <div class="flex justify-center py-6">
        <div class="loader"></div>
      </div>

      <!-- Estado Interactivo -->
      <div class="space-y-3">
        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2">
          <span>{{ status }}</span>
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
          {{ subStatus }}
        </p>
      </div>

      <!-- Mensaje institucional mejorado -->
      <div
        class="text-xs text-gray-500 dark:text-gray-400
               border-t border-gray-200/50 dark:border-gray-700/50 pt-6"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <svg class="w-4 h-4 text-[#1FAF8B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span class="font-semibold uppercase tracking-wider text-[10px]">Conexión encriptada PKCE</span>
        </div>
        Asegurando tu identidad con
        <span class="font-bold text-[#0B3C5D] dark:text-[#1FAF8B]">
          estándares de grado bancario
        </span>.
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader {
  width: 100%;
  max-width: 280px;
  height: 8px;
  border-radius: 20px;
  background: 
    linear-gradient(#1FAF8B 0 0) 0/0% no-repeat
    #eee;
  animation: l14 2s infinite linear;
}

@keyframes l14 {
    100% {background-size:100%}
}

/* Dark mode adjustment for the loader base */
:deep(.dark) .loader,
.dark .loader {
  background: 
    linear-gradient(#1FAF8B 0 0) 0/0% no-repeat
    rgba(255, 255, 255, 0.1);
}

</style>
