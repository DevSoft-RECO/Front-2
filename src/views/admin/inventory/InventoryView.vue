<script setup>
import { ref, onMounted, watch } from 'vue';
import InventoryService from '@/services/inventory/InventoryService';
import AgencyService from '@/services/agency/AgencyService';
import CategoryService from '@/services/inventory/CategoryService';
import InventoryFormModal from '@/components/inventory/InventoryFormModal.vue';
import IncidentModal from '@/components/inventory/IncidentModal.vue';
import Swal from 'sweetalert2';
import AdminContent from '@/components/layout/AdminContent.vue'; // Asumo la ruta de tu layout
import BrandLoader from '@/components/shared/BrandLoader.vue';

// State
const inventory = ref([]);
const agencies = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedAgency = ref('');
const selectedCategory = ref('');
const categories = ref([]);

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalItems = ref(0);
const lastPage = ref(1);
const fromItem = ref(0);
const toItem = ref(0);

// Modals State
const showFormModal = ref(false);
const selectedItem = ref(null);
const showIncidentModal = ref(false);
const selectedIncidentItem = ref(null);

// Fetch Data
// Fetch Data
const loadInventory = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            per_page: itemsPerPage.value,
            agencia_id: selectedAgency.value,
            categoria_id: selectedCategory.value,
            // Search logic usually handled by backend, adding basic search param if supported
            // Assuming backend search might look for a general 'search' or specific fields
            // For now, passing 'search' as a generic parameter or we might need to adjust based on backend implementation
             ...(searchQuery.value ? { search: searchQuery.value } : {})
        };

        const res = await InventoryService.getAll(params);

        // Handle Paginated Response
        inventory.value = res.data.data;
        totalItems.value = res.data.total;
        currentPage.value = res.data.current_page;
        lastPage.value = res.data.last_page;
        itemsPerPage.value = res.data.per_page;
        fromItem.value = res.data.from;
        toItem.value = res.data.to;

    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el inventario', 'error');
    } finally {
        loading.value = false;
    }
};

const loadCategories = async () => {
    try {
        const res = await CategoryService.getAll();
        categories.value = res.data;
    } catch (error) {
        console.error('Error cargando categorías:', error);
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

// Computed properties for filtering/pagination removed as we now use server-side logic

// Watch para resetear página al filtrar
// Watch para recargar datos al filtrar
watch([searchQuery, selectedAgency, selectedCategory], () => {
    currentPage.value = 1; // Reset to first page
    loadInventory();
});

// Watch para recargar al cambiar de página (next/prev) - aunque la lógica de botones llama directly a loadInventory tambien
// Mejor solo llamar loadInventory en los botonesNext/Prev y quitar watch de currentPage si se maneja manual
// Pero para consistencia, dejemos que actions modifiquen currentPage y un watch recargue.
watch(currentPage, () => {
    loadInventory();
});

// Actions
const openCreateModal = () => {
    selectedItem.value = null;
    showFormModal.value = true;
};

const openEditModal = (item) => {
    selectedItem.value = { ...item };
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
    if (currentPage.value < lastPage.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};



onMounted(() => {
    loadInventory();
    loadAgencies();
    loadCategories();
});
</script>

<template>
    <AdminContent title="Inventario General" subtitle="Gestión de activos, equipos y mobiliario">

        <div class="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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

                <div class="w-full md:w-48">
                    <select
                        v-model="selectedCategory"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Todas las Categorías</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.nombre }}
                        </option>
                    </select>
                </div>

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
                        placeholder="Buscar activo..."
                    >
                </div>

                <button
                    @click="openCreateModal"
                    class="bg-azul-cope hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    <span class="hidden sm:inline">Nuevo</span>
                </button>
            </div>
        </div>

        <div class="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <table class="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                <colgroup>
                    <col class="w-[12%]" /> <col class="w-[20%]" /> <col class="w-[15%]" /> <col class="w-[15%]" /> <col class="w-[13%]" /> <col class="w-[10%]" /> <col class="w-[15%]" /> </colgroup>

                <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equipo / Marca</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agencia</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responsable</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credenciales</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-if="loading && inventory.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                            <BrandLoader />
                        </td>
                    </tr>
                    <tr v-else-if="inventory.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                            {{ searchQuery || selectedAgency || selectedCategory ? 'No se encontraron resultados.' : 'No hay activos registrados.' }}
                        </td>
                    </tr>
                    <tr v-for="item in inventory" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <td class="px-6 py-4 break-all">
                            <div class="flex flex-col items-start gap-1">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {{ item.codigo_activo }}
                                </span>
                                <span v-if="item.ip_address" class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {{ item.ip_address }}
                                </span>
                            </div>
                        </td>

                        <td class="px-6 py-4 break-words">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ item.nombre_equipo || 'Sin nombre' }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.marca }} {{ item.modelo }}</div>
                        </td>

                        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 break-words">
                            {{ item.agencia?.nombre || '---' }}
                        </td>

                        <td class="px-6 py-4 break-words">
                            <div class="text-sm text-gray-900 dark:text-gray-200">
                                {{ item.nombre_responsable || 'Sin asignar' }}
                            </div>
                            <div class="text-xs text-gray-500">
                                {{ item.area }}
                            </div>
                        </td>

                        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 break-words">
                            <div v-if="item.usuario_equipo || item.password_equipo" class="flex flex-col gap-1">
                                <div v-if="item.usuario_equipo" class="flex items-center gap-1 text-xs">
                                    <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span class="font-medium text-gray-700 dark:text-gray-300">{{ item.usuario_equipo }}</span>
                                </div>
                                <div v-if="item.password_equipo" class="flex items-center gap-1 text-xs">
                                    <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                    <span class="font-mono text-gray-600 dark:text-gray-400">{{ item.password_equipo }}</span>
                                </div>
                            </div>
                            <span v-else class="text-xs text-gray-400 italic">Sin credenciales</span>
                        </td>

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

                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="openHistoryModal(item)" class="text-gray-500 hover:text-azul-cope" title="Historial">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </button>
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

        <div v-if="inventory.length > 0 || loading" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div class="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                Mostrando <span class="font-medium">{{ fromItem }}</span> a <span class="font-medium">{{ toItem }}</span> de <span class="font-medium">{{ totalItems }}</span> resultados
            </div>
            <div class="flex items-center gap-2 order-1 sm:order-2">
                 <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 rounded-md border text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                 <span class="text-sm text-gray-600">Pág. {{ currentPage }} de {{ lastPage }}</span>
                 <button @click="nextPage" :disabled="currentPage === lastPage" class="px-3 py-1 rounded-md border text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
            </div>
        </div>

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

    </AdminContent>
</template>
