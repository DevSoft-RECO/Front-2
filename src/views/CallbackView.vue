<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios' // Mantenemos axios para la configuración robusta

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref('Validando acceso institucional')
const subStatus = ref(
  'Estamos verificando tu identidad con los sistemas de la Cooperativa YAMAN KUTX.'
)

onMounted(async () => {
  // ADAPTACIÓN: Usamos el token directo según el refactor reciente
  const token = route.query.token

  if (!token) {
    status.value = 'Autenticación no válida'
    subStatus.value =
      'No se recibió la información necesaria para validar la sesión.'
    return
  }

  try {
    // 1. Configuración Robusta (Race Condition Fix)
    authStore.token = token
    localStorage.setItem('access_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // 2. Procesar en store
    await authStore.handleDirectToken(token)

    status.value = 'Acceso autorizado'
    subStatus.value =
      'Bienvenido a los sistemas internos de la Cooperativa YAMAN KUTX.'

    setTimeout(() => {
      router.push({ name: 'dashboard' })
    }, 900)

  } catch (e) {
    console.error(e)
    status.value = 'Error de autenticación'
    subStatus.value =
      'No fue posible validar tu sesión. Por favor, intenta nuevamente.'
  }
})
</script>
<template>
  <div
    class="min-h-screen flex items-center justify-center px-4
           bg-gradient-to-br from-[#0B3C5D]/10 to-[#1FAF8B]/10
           dark:from-gray-900 dark:to-gray-950"
  >
    <div
      class="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900
             shadow-2xl border border-gray-200 dark:border-gray-800
             p-8 text-center space-y-6"
    >
      <!-- Marca -->
      <div class="space-y-2">
        <div class="flex justify-center">
          <img src="@/assets/logoyk.svg" alt="Logo Yaman Kutx" class="brand-logo" />
        </div>

        <h1 class="text-lg font-semibold text-[#0B3C5D] dark:text-white">
          Cooperativa YAMAN KUTX
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Plataforma Corporativa
        </p>
      </div>

      <!-- Loader -->
      <div class="flex justify-center py-2">
        <div class="relative h-10 w-10">
          <div
            class="absolute inset-0 rounded-full border-2
                   border-gray-300 dark:border-gray-700"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-2
                   border-t-[#1FAF8B] animate-spin"
          ></div>
        </div>
      </div>

      <!-- Estado -->
      <div class="space-y-2">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">
          {{ status }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ subStatus }}
        </p>
      </div>

      <!-- Mensaje institucional -->
      <div
        class="text-xs text-gray-400 dark:text-gray-500
               border-t border-gray-200 dark:border-gray-800 pt-4"
      >
        Este proceso garantiza un acceso seguro a los sistemas internos de la
        <span class="font-medium text-[#0B3C5D] dark:text-[#1FAF8B]">
          Cooperativa YAMAN KUTX
        </span>.
        <br />
        Por favor, no cierres ni recargues esta ventana.
      </div>
    </div>
  </div>
</template>
