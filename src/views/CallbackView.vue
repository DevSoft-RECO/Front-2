<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Asegúrate de importar el store

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref('Validando código de autorización...')
const errorData = ref(null) // Para mostrar el detalle del error

onMounted(async () => {
  const code = route.query.code

  if (!code) {
    status.value = 'Error: No llegó ningún código en la URL.'
    return
  }

  try {
    // Intentamos canjear el código
    await authStore.handleCallback(code)

    status.value = '¡Éxito! Redirigiendo al Dashboard...'
    
    // Solo redirigimos si NO hubo error
    setTimeout(() => {
       router.push({ name: 'dashboard' })
    }, 1000)

  } catch (e) {
    console.error("Fallo el canje de token:", e)
    
    status.value = 'ERROR FATAL EN EL INTERCAMBIO DE TOKEN'
    
    // Capturamos el error detallado
    if (e.response) {
        errorData.value = {
            status: e.response.status,
            data: e.response.data
        }
    } else {
        errorData.value = e.message
    }
    
    // IMPORTANTE: NO hacemos router.push ni redirección aquí.
    // Nos quedamos en esta pantalla para leer el error.
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full text-center">
      
      <h1 class="text-xl font-bold mb-4 text-gray-800">{{ status }}</h1>

      <div class="text-xs text-gray-400 mb-4 break-all">
         Código recibido: {{ route.query.code?.substring(0, 20) }}...
      </div>

      <div v-if="errorData" class="bg-red-50 border border-red-200 p-4 rounded text-left">
        <h3 class="text-red-700 font-bold mb-2">Detalles del Error:</h3>
        <pre class="text-xs text-red-600 overflow-auto whitespace-pre-wrap">{{ JSON.stringify(errorData, null, 2) }}</pre>
      </div>

      <div v-else class="flex justify-center my-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <a v-if="errorData" href="/" class="mt-6 inline-block bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700">
        Volver a intentar Login
      </a>

    </div>
  </div>
</template>