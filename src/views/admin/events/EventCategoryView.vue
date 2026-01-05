<script setup>
import { ref, onMounted } from 'vue';
import AdminContent from '@/components/layout/AdminContent.vue';
import EventCategoryService from '@/services/events/EventCategoryService';
import CategoryModal from './components/CategoryModal.vue';
import Swal from 'sweetalert2';

const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);
const selectedItem = ref(null);

const fetchCategories = async () => {
    loading.value = true;
    try {
        const res = await EventCategoryService.getAll();
        categories.value = res.data.data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
    } finally {
        loading.value = false;
    }
};

const openCreate = () => {
    selectedItem.value = null;
    showModal.value = true;
};

const openEdit = (item) => {
    selectedItem.value = { ...item };
    showModal.value = true;
};

const handleSave = async (formData) => {
    try {
        if (selectedItem.value?.id) {
            await EventCategoryService.update(selectedItem.value.id, formData);
        } else {
            await EventCategoryService.create(formData);
        }
        showModal.value = false;
        fetchCategories();
        Swal.fire('Guardado', 'Categoría guardada correctamente', 'success');
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error al guardar', 'error');
    }
};

const handleDelete = async (id) => {
    const res = await Swal.fire({
        title: '¿Eliminar categoría?',
        text: "Los eventos asociados podrían quedarse sin categoría.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (res.isConfirmed) {
        try {
            await EventCategoryService.delete(id);
            fetchCategories();
            Swal.fire('Eliminado', 'Categoría eliminada', 'success');
        } catch (error) {
            console.error(error);
             Swal.fire('Error', 'Error al eliminar', 'error');
        }
    }
};

onMounted(() => {
    fetchCategories();
});
</script>

<template>
    <AdminContent title="Categorías de Eventos" subtitle="Gestiona los tipos de actividades del calendario">

        <div class="mb-6 flex justify-end">
             <button @click="openCreate" class="bg-azul-cope hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Nueva Categoría
            </button>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
             <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vista Previa</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-if="categories.length === 0 && !loading">
                        <td colspan="4" class="px-6 py-4 text-center text-gray-500">No hay categorías registradas.</td>
                    </tr>
                    <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ cat.name }}</td>
                        <td class="px-6 py-4 text-sm text-gray-500">
                            <div class="flex gap-2 items-center">
                                <span class="w-4 h-4 rounded-full border border-gray-200 shadow-sm" :style="{ backgroundColor: cat.color }"></span>
                                <span class="text-xs font-mono">{{ cat.color }}</span>
                            </div>
                        </td>
                         <td class="px-6 py-4 text-sm">
                            <span
                                class="px-2 py-1 rounded text-xs font-bold"
                                :style="{ backgroundColor: cat.color, color: cat.text_color }"
                            >
                                {{ cat.name }}
                            </span>
                        </td>
                         <td class="px-6 py-4 text-right text-sm font-medium space-x-2">
                             <button @click="openEdit(cat)" class="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400">Editar</button>
                             <button @click="handleDelete(cat.id)" class="text-red-600 hover:text-red-900 dark:hover:text-red-400">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
             </table>
        </div>

        <CategoryModal
            :isOpen="showModal"
            :item="selectedItem"
            @close="showModal = false"
            @save="handleSave"
        />

    </AdminContent>
</template>
