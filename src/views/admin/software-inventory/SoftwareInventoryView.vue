<script setup>
import { ref, onMounted, watch } from 'vue';
import SoftwareService from '@/services/inventory/SoftwareService';
import AdminContent from '@/components/layout/AdminContent.vue';
import BrandLoader from '@/components/shared/BrandLoader.vue';
import SoftwareFormModal from './SoftwareFormModal.vue';
import Swal from 'sweetalert2';

// State
const softwareList = ref([]);
const loading = ref(false);

// Filters
const filterName = ref('');
const filterType = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalItems = ref(0);
const lastPage = ref(1);
const fromItem = ref(0);
const toItem = ref(0);

// Modal State
const showModal = ref(false);
const selectedItem = ref(null);

// Methods
const fetchSoftware = async (page = 1) => {
    loading.value = true;
    try {
        const params = {
            page: page,
            per_page: itemsPerPage.value,
            ...(filterName.value ? { nombre: filterName.value } : {}),
            ...(filterType.value ? { tipo: filterType.value } : {})
        };

        const res = await SoftwareService.getAll(params);

        softwareList.value = res.data.data;

        // Update Pagination Meta
        totalItems.value = res.data.total;
        currentPage.value = res.data.current_page;
        lastPage.value = res.data.last_page;
        itemsPerPage.value = res.data.per_page;
        fromItem.value = res.data.from;
        toItem.value = res.data.to;

    } catch (error) {
        console.error("Error cargando inventario software:", error);
        Swal.fire('Error', 'No se pudo cargar el inventario de software', 'error');
    } finally {
        loading.value = false;
    }
};

// Actions
const openCreateModal = () => {
    selectedItem.value = null;
    showModal.value = true;
};

const openEditModal = (item) => {
    selectedItem.value = { ...item };
    showModal.value = true;
};

const handleSave = async (formData) => {
    try {
        if (selectedItem.value?.id) {
            await SoftwareService.update(selectedItem.value.id, formData);
            Swal.fire('Actualizado', 'Software actualizado correctamente', 'success');
        } else {
            await SoftwareService.create(formData);
            Swal.fire('Creado', 'Software registrado correctamente', 'success');
        }
        showModal.value = false;
        fetchSoftware(currentPage.value); // Reload current page
    } catch (error) {
         console.error(error);
         Swal.fire('Error', 'Hubo un error al guardar', 'error');
    }
};

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminará este registro permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await SoftwareService.delete(id);
            Swal.fire('Eliminado', 'Registro eliminado.', 'success');
            fetchSoftware(currentPage.value);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo eliminar', 'error');
        }
    }
};

// Pagination Actions
const nextPage = () => {
    if (currentPage.value < lastPage.value) {
        fetchSoftware(currentPage.value + 1);
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        fetchSoftware(currentPage.value - 1);
    }
};

// Watchers
// Reload when filters change (debounce could be added here if needed, directly waiting for enter/blur on input usually suffices but user requested instant search alike?)
// User example suggested generic search. Let's trigger on change but maybe debounce is better. For now simple watch.
let debounceTimeout;
watch([filterName, filterType], () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        fetchSoftware(1); // Reset to page 1
    }, 500);
});

onMounted(() => {
    fetchSoftware();
});
</script>

<template>
    <AdminContent title="Inventario de Software" subtitle="Gestión de licencias y aplicaciones">

        <!-- Filters & Actions -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <!-- Search -->
            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                 <div class="relative w-full md:w-64">
                     <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </span>
                    <input
                        v-model="filterName"
                        type="text"
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all"
                        placeholder="Buscar por nombre..."
                    >
                </div>
                 <div class="w-full md:w-48">
                    <input
                        v-model="filterType"
                        type="text"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all"
                        placeholder="Filtrar por tipo..."
                    >
                </div>
            </div>

            <!-- New Button -->
            <button
                @click="openCreateModal"
                class="bg-azul-cope hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                <span class="hidden sm:inline">Nuevo Software</span>
            </button>
        </div>

        <!-- Table -->
        <div class="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
             <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Software</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credenciales</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acceso</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-if="loading && softwareList.length === 0">
                        <td colspan="5" class="px-6 py-8 text-center text-gray-500"><BrandLoader /></td>
                    </tr>
                    <tr v-else-if="softwareList.length === 0">
                         <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                            {{ filterName || filterType ? 'No se encontraron resultados.' : 'No hay software registrado.' }}
                        </td>
                    </tr>
                    <tr v-for="item in softwareList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">

                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ item.nombre }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ item.descripcion }}</div>
                        </td>

                        <td class="px-6 py-4 whitespace-nowrap">
                             <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {{ item.tipo || 'General' }}
                            </span>
                        </td>

                         <td class="px-6 py-4">
                            <div v-if="item.usuario || item.clave" class="flex flex-col gap-1">
                                <div v-if="item.usuario" class="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                   <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                   {{ item.usuario }}
                                </div>
                                <div v-if="item.clave" class="flex items-center gap-1 text-xs text-mono text-gray-500 dark:text-gray-400">
                                   <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                   {{ item.clave }}
                                </div>
                            </div>
                            <span v-else class="text-xs text-gray-400 italic">Sin credenciales</span>
                        </td>

                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <a v-if="item.enlace" :href="item.enlace" target="_blank" class="text-azul-cope hover:underline flex items-center gap-1">
                                Ir al sitio
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <span v-else class="text-gray-400">-</span>
                        </td>

                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="openEditModal(item)" class="text-gray-500 hover:text-amber-600" title="Editar">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button @click="handleDelete(item.id)" class="text-gray-500 hover:text-red-600" title="Eliminar">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </td>

                    </tr>
                </tbody>
             </table>
        </div>

        <!-- Pagination -->
        <div v-if="softwareList.length > 0 || loading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div class="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                Mostrando <span class="font-medium">{{ fromItem }}</span> a <span class="font-medium">{{ toItem }}</span> de <span class="font-medium">{{ totalItems }}</span> resultados
            </div>
            <div class="flex items-center gap-2 order-1 sm:order-2">
                 <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 rounded-md border text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                 <span class="text-sm text-gray-600">Pág. {{ currentPage }} de {{ lastPage }}</span>
                 <button @click="nextPage" :disabled="currentPage === lastPage" class="px-3 py-1 rounded-md border text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
            </div>
        </div>

        <SoftwareFormModal
            :isOpen="showModal"
            :item="selectedItem"
            @close="showModal = false"
            @save="handleSave"
        />

    </AdminContent>
</template>
