<script setup>
import { ref, onMounted } from 'vue';
import CategoryService from '@/services/inventory/CategoryService';
import Swal from 'sweetalert2';
import BrandLoader from '@/components/shared/BrandLoader.vue';

const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const form = ref({
    id: null,
    nombre: '',
    descripcion: ''
});

// Cargar categorías
const loadCategories = async () => {
    loading.value = true;
    try {
        const res = await CategoryService.getAll();
        categories.value = res.data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
    } finally {
        loading.value = false;
    }
};

// Abrir modal para crear
const openCreateModal = () => {
    isEditing.value = false;
    form.value = { id: null, nombre: '', descripcion: '' };
    showModal.value = true;
};

// Abrir modal para editar
const openEditModal = (category) => {
    isEditing.value = true;
    form.value = { ...category };
    showModal.value = true;
};

// Guardar (Crear o Editar)
const saveCategory = async () => {
    if (!form.value.nombre) return Swal.fire('Error', 'El nombre es obligatorio', 'warning');

    try {
        if (isEditing.value) {
            await CategoryService.update(form.value.id, form.value);
            Swal.fire('Actualizado', 'Categoría actualizada correctamente', 'success');
        } else {
            await CategoryService.create(form.value);
            Swal.fire('Creado', 'Categoría creada correctamente', 'success');
        }
        showModal.value = false;
        loadCategories();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Hubo un problema al guardar', 'error');
    }
};

// Eliminar
const deleteCategory = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await CategoryService.delete(id);
            Swal.fire('Eliminado', 'La categoría ha sido eliminada.', 'success');
            loadCategories();
        } catch {
            Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
        }
    }
};

onMounted(() => {
    loadCategories();
});
</script>

<template>
    <div class="p-6">
        <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías de Inventario</h1>
            <button
                @click="openCreateModal"
                class="bg-azul-cope hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Nueva Categoría
            </button>
        </div>

        <!-- Tabla -->
        <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-if="loading && categories.length === 0">
                        <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                            <BrandLoader />
                        </td>
                    </tr>
                    <tr v-else-if="categories.length === 0">
                        <td colspan="4" class="px-6 py-4 text-center text-gray-500">No hay categorías registradas.</td>
                    </tr>
                    <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ cat.id }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ cat.nombre }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ cat.descripcion || '---' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button @click="openEditModal(cat)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">Editar</button>
                            <button @click="deleteCategory(cat.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Create/Edit -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}
                </h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input
                            v-model="form.nombre"
                            type="text"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-azul-cope focus:border-transparent"
                            placeholder="Ej. Laptops"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea
                            v-model="form.descripcion"
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-azul-cope focus:border-transparent"
                        ></textarea>
                    </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                    <button
                        @click="showModal = false"
                        class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        @click="saveCategory"
                        class="px-4 py-2 bg-azul-cope hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
