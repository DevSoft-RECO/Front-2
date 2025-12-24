<script setup>
import { ref, computed, onMounted } from 'vue';
import InventoryService from '@/services/inventory/InventoryService';
import AgencyService from '@/services/agency/AgencyService';
import InventoryFormModal from '@/components/inventory/InventoryFormModal.vue';
import IncidentModal from '@/components/inventory/IncidentModal.vue';
import Swal from 'sweetalert2';

// State
const inventory = ref([]);
const agencies = ref([]); // Lista de agencias para el select
const loading = ref(false);
const searchQuery = ref('');
const selectedAgency = ref(''); // Filtro por agencia

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(10); // Elementos por página

// Modals State
const showFormModal = ref(false);
const selectedItem = ref(null); // For Edit/Incidents

const showIncidentModal = ref(false);
const selectedIncidentItem = ref(null); // Separate ref to avoid conflicts

// Fetch Data
const loadInventory = async () => {
    loading.value = true;
    try {
        const res = await InventoryService.getAll();
        inventory.value = res.data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el inventario', 'error');
    } finally {
        loading.value = false;
    }
};

const loadAgencies = async () => {
    try {
        const res = await AgencyService.getAll();
        agencies.value = res.data;
    } catch (error) {
        console.error('Error cargando agencias:', error);
    }
};

// Computed: Filtered Data
const filteredInventory = computed(() => {
    let result = inventory.value;

    // 1. Filter by Agency
    if (selectedAgency.value) {
        result = result.filter(item => item.agencia_id === selectedAgency.value || item.agencia?.id === selectedAgency.value);
    }

    // 2. Filter by Search Query
    if (searchQuery.value) {
        const lowerQuery = searchQuery.value.toLowerCase();
        result = result.filter(item => {
            const code = item.codigo_activo?.toLowerCase() || '';
            const name = item.nombre_equipo?.toLowerCase() || '';
            const agency = item.agencia?.nombre?.toLowerCase() || '';
            const category = item.categoria?.nombre?.toLowerCase() || '';
            const responsible = item.nombre_responsable?.toLowerCase() || '';

            return code.includes(lowerQuery) ||
                   name.includes(lowerQuery) ||
                   agency.includes(lowerQuery) ||
                   category.includes(lowerQuery) ||
                   responsible.includes(lowerQuery);
        });
    }

    return result;
});

// Computed: Pagination
const totalPages = computed(() => Math.ceil(filteredInventory.value.length / itemsPerPage.value));

const paginatedInventory = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredInventory.value.slice(start, end);
});

// Watch para resetear página al filtrar
import { watch } from 'vue';
watch([searchQuery, selectedAgency], () => {
    currentPage.value = 1;
});

// Actions
const openCreateModal = () => {
    selectedItem.value = null;
    showFormModal.value = true;
};

const openEditModal = (item) => {
    selectedItem.value = { ...item }; // Clone to avoid direct mutation
    showFormModal.value = true;
};

const openHistoryModal = (item) => {
    selectedIncidentItem.value = item;
    showIncidentModal.value = true;
};

const handleSave = async (formData) => {
    try {
        if (formData.id) {
            await InventoryService.update(formData.id, formData);
            Swal.fire('Actualizado', 'Activo actualizado correctamente', 'success');
        } else {
            await InventoryService.create(formData);
            Swal.fire('Creado', 'Activo creado correctamente', 'success');
        }
        showFormModal.value = false;
        loadInventory();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Hubo un error al guardar el activo', 'error');
    }
};

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará el activo y todo su historial.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await InventoryService.delete(id);
            Swal.fire('Eliminado', 'El activo ha sido eliminado.', 'success');
            loadInventory();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo eliminar el activo', 'error');
        }
    }
};
// Pagination Actions
const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};

const goToPage = (page) => {
    currentPage.value = page;
};
onMounted(() => {
    loadInventory();
    loadAgencies();
});
</script>

<template>
    <div class="p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Inventario General</h1>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Gestión de activos, equipos y mobiliario</p>
            </div>

            <div class="flex gap-3 w-full md:w-auto">
                <!-- Select Agencia -->
                <div class="w-full md:w-48">
                    <select
                        v-model="selectedAgency"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Todas las Agencias</option>
                        <option v-for="agency in agencies" :key="agency.id" :value="agency.id">
                            {{ agency.nombre }}
                        </option>
                    </select>
                </div>

                <!-- Search -->
                <div class="relative w-full md:w-64">
                     <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
                     </span>
                    <input
                        v-model="searchQuery"
                        type="text"
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all"
                        placeholder="Buscar por código, serie..."
                    >
                </div>

                <button
                    @click="openCreateModal"
                    class="bg-azul-cope hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    <span class="hidden sm:inline">Nuevo Activo</span>
                </button>
            </div>
        </div>

        <!-- Data Table -->
        <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equipo / Marca</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agencia</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responsable</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-if="loading && inventory.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                            <div class="flex justify-center items-center gap-2">
                                <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cargando inventario...
                            </div>
                        </td>
                    </tr>
                    <tr v-else-if="filteredInventory.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                            {{ searchQuery ? 'No se encontraron resultados para tu búsqueda.' : 'No hay activos registrados.' }}
                        </td>
                    </tr>
                    <tr v-for="item in paginatedInventory" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <!-- Código -->
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {{ item.codigo_activo }}
                            </span>
                        </td>

                        <!-- Equipo / Marca -->
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ item.nombre_equipo || 'Sin nombre' }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.marca }} {{ item.modelo }}</div>
                        </td>

                        <!-- Agencia -->
                        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {{ item.agencia?.nombre || '---' }}
                        </td>

                        <!-- Responsable -->
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-900 dark:text-gray-200">{{ item.nombre_responsable || 'Sin asignar' }}</div>
                            <div class="text-xs text-gray-500">{{ item.area }}</div>
                        </td>

                        <!-- Categoría -->
                        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {{ item.categoria?.nombre || '---' }}
                        </td>

                        <!-- Estado -->
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span
                                v-if="item.activo"
                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            >
                                <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span> Activo
                            </span>
                            <span
                                v-else
                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                            >
                                <span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Inactivo
                            </span>
                        </td>

                        <!-- Acciones -->
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    @click="openHistoryModal(item)"
                                    class="text-gray-500 hover:text-azul-cope dark:hover:text-blue-400"
                                    title="Historial de Incidentes"
                                >
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </button>
                                <button
                                    @click="openEditModal(item)"
                                    class="text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
                                    title="Editar"
                                >
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button
                                    @click="handleDelete(item.id)"
                                    class="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                    title="Eliminar"
                                >
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="filteredInventory.length > 0" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div class="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                Mostrando <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> a <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredInventory.length) }}</span> de <span class="font-medium">{{ filteredInventory.length }}</span> resultados
            </div>

            <div class="flex items-center gap-2 order-1 sm:order-2">
                <button
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Anterior
                </button>

                <div class="hidden sm:flex gap-1">
                    <button
                        v-for="page in totalPages"
                        :key="page"
                        @click="goToPage(page)"
                        :class="[
                            'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                            currentPage === page
                                ? 'bg-azul-cope text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        ]"
                    >
                        {{ page }}
                    </button>
                </div>
                 <span class="sm:hidden text-sm text-gray-600 dark:text-gray-300">Pág. {{ currentPage }} de {{ totalPages }}</span>

                <button
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Siguiente
                </button>
            </div>
        </div>

        <!-- Modals -->
        <InventoryFormModal
            :isOpen="showFormModal"
            :inventoryItem="selectedItem"
            @close="showFormModal = false"
            @save="handleSave"
        />

        <IncidentModal
            :isOpen="showIncidentModal"
            :inventoryId="selectedIncidentItem?.id"
            :inventoryCode="selectedIncidentItem?.codigo_activo"
            @close="showIncidentModal = false"
        />

    </div>
</template>
