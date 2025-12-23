<template>
    <div class="space-y-6 animate-fade-in-up">

      <!-- Welcome Card -->
      <div v-if="authStore.user" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                  Hola, <span class="text-azul-cope">{{ authStore.user.name }}</span>
              </h2>
              <p class="text-gray-500 dark:text-gray-400 mt-1">
                  Bienvenido a la App de Mercadeo. Tu rol es: <span class="font-semibold">{{ userRole }}</span>
              </p>
          </div>
          <div class="mt-4 md:mt-0">
             <!-- Podríamos poner algo aquí -->
          </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <a @click="returnToPortal" class="cursor-pointer group">
            <div class="p-6 rounded-xl shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:border-azul-cope">
            <div class="flex items-center justify-between">
                <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Sistema</p>
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-azul-cope transition-colors">Portal Principal</h3>
                </div>
                <div class="p-3 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
            </div>
            </div>
        </a>
      </div>


      <div class="rounded-xl shadow-sm border p-8 h-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
        <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-full mb-4">
             <svg class="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Área de Trabajo Hija</h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
            Sesión compartida exitosamente.
        </p>
      </div>

    </div>

</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const userRole = computed(() => {
    if (authStore.user?.roles && authStore.user.roles.length > 0) {
        return authStore.user.roles[0];
    }
    return authStore.user?.puesto || 'Invitado';
});


// === LÓGICA DE RETORNO ===
const returnToPortal = () => {
    // Obtenemos la URL de la madre desde el .env
    const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';

    // Redirigimos al Dashboard de la Madre
    window.location.href = `${motherAppUrl}/admin/dashboard`;
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
