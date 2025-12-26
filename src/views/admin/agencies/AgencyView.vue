<script setup>
import { ref, onMounted } from 'vue';
import AgencyService from '@/services/agency/AgencyService';
import Swal from 'sweetalert2';
import BrandLoader from '@/components/shared/BrandLoader.vue';

const agencias = ref([]);
const loading = ref(false);
const syncing = ref(false);

// Cargar datos locales (Rápido)
const loadAgencias = async () => {
    loading.value = true;
    try {
        const response = await AgencyService.getAll();
        agencias.value = response.data;
    } catch (error) {
        console.error('Error cargando agencias locales', error);
        Swal.fire('Error', 'No se pudieron cargar las agencias locales', 'error');
    } finally {
        loading.value = false;
    }
};

// Acción del Botón "Actualizar desde Madre"
const handleSync = async () => {
    syncing.value = true;
    try {
// Mostramos un toast o loading
Swal.fire({
            title: 'Sincronizando...',
            text: 'Obteniendo datos de la Central',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const res = await AgencyService.syncWithMother();

        Swal.fire({
            icon: 'success',
            title: 'Sincronización Exitosa',
            text: res.data.message || 'Datos actualizados correctamente'
        });

        // Recargar la tabla con los datos frescos
        await loadAgencias();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo conectar con la App Madre o hubo un error en la sincronización', 'error');
    } finally {
        syncing.value = false;
    }
};

onMounted(() => {
    loadAgencias();
});
</script>

<template>
    <div class="p-6">
        <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
                 <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Agencias</h1>
                 <p class="text-gray-600 dark:text-gray-400 text-sm">Base de datos Espejo (Sincronizada con Central)</p>
            </div>

            <button
                @click="handleSync"
                :disabled="syncing"
                class="flex items-center gap-2 bg-azul-cope hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg v-if="syncing" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span v-if="syncing">Sincronizando...</span>
                <span v-else>Sincronizar con Central</span>
            </button>
        </div>

        <!-- Tabla de Agencias -->
        <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Madre</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dirección</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Última Sync</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-if="loading && agencias.length === 0">
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                            <BrandLoader />
                        </td>
                    </tr>
                    <tr v-else-if="agencias.length === 0">
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay agencias sincronizadas aún.</td>
                    </tr>
                    <tr v-for="agencia in agencias" :key="agencia.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {{ agencia.agencia_madre_id }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {{ agencia.codigo }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {{ agencia.nombre }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {{ agencia.direccion || '---' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {{ agencia.updated_at ? new Date(agencia.updated_at).toLocaleString() : '---' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
