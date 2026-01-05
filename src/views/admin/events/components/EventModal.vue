<script setup>
import { ref, watch, onMounted } from 'vue';
import EventCategoryService from '@/services/events/EventCategoryService';

const props = defineProps({
    isOpen: Boolean,
    item: Object // Event structure
});

const emit = defineEmits(['close', 'save', 'delete']);

const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all";

const categories = ref([]);
const form = ref({
    title: '',
    start: '',
    end: '',
    is_all_day: false,
    event_category_id: null,
    description: '',
    location: ''
});

// Load Categories once
onMounted(async () => {
    try {
        const res = await EventCategoryService.getAll();
        categories.value = res.data.data;
    } catch (e) {
        console.error("Error loading categories", e);
    }
});

// Helper to format ISO to datetime-local (YYYY-MM-DDTHH:mm)
const formatDateTime = (isoStr) => {
    if (!isoStr) return '';
    return isoStr.substring(0, 16);
};

watch(() => props.isOpen, (newVal) => {
    if (newVal && props.item) {
        // Populate form
        form.value = {
            id: props.item.id,
            title: props.item.title,
            start: formatDateTime(props.item.start),
            end: formatDateTime(props.item.end),
            is_all_day: props.item.is_all_day || false,
            event_category_id: props.item.event_category_id,
            description: props.item.description || '',
            location: props.item.location || ''
        };
    }
});

const handleSubmit = () => {
    // Basic validation
    if (!form.value.title || !form.value.start) return;

    // Send data
    emit('save', form.value);
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {{ item?.id ? 'Editar Evento' : 'Nuevo Evento' }}
                </h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div class="p-6 overflow-y-auto space-y-4">
                <form @submit.prevent="handleSubmit">

                    <div class="mb-3">
                        <label :class="labelClass">Título *</label>
                        <input v-model="form.title" type="text" :class="inputClass" required placeholder="Ej: Reunión de equipo">
                    </div>

                    <div class="mb-3 grid grid-cols-2 gap-4">
                        <div>
                             <label :class="labelClass">Inicio *</label>
                             <input v-model="form.start" type="datetime-local" :class="inputClass" required>
                        </div>
                        <div>
                             <label :class="labelClass">Fin</label>
                             <input v-model="form.end" type="datetime-local" :class="inputClass">
                        </div>
                    </div>

                    <div class="mb-3 flex items-center gap-2">
                        <input v-model="form.is_all_day" type="checkbox" id="allDay" class="rounded text-azul-cope focus:ring-azul-cope bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                         <label for="allDay" class="text-sm text-gray-700 dark:text-gray-300 select-none">Todo el día</label>
                    </div>

                    <div class="mb-3">
                        <label :class="labelClass">Categoría</label>
                        <div class="flex items-center gap-2">
                            <select v-model="form.event_category_id" :class="inputClass">
                                <option :value="null">Sin Categoría</option>
                                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                    {{ cat.name }}
                                </option>
                            </select>
                            <div
                                v-if="form.event_category_id"
                                class="w-6 h-6 rounded border border-gray-200 shrink-0"
                                :style="{ backgroundColor: categories.find(c => c.id === form.event_category_id)?.color }"
                            ></div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label :class="labelClass">Ubicación</label>
                        <input v-model="form.location" type="text" :class="inputClass" placeholder="Sala de Juntas 1">
                    </div>

                    <div class="mb-3">
                        <label :class="labelClass">Descripción</label>
                        <textarea v-model="form.description" rows="3" :class="inputClass"></textarea>
                    </div>

                </form>
            </div>

            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between shrink-0">
                <button
                    v-if="item?.id"
                    @click="$emit('delete', item.id)"
                    class="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                >
                    Eliminar
                </button>
                <div v-else></div> <!-- Spacer -->

                <div class="flex gap-3">
                    <button @click="$emit('close')" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
                    <button @click="handleSubmit" class="px-6 py-2 bg-azul-cope hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/30">Guardar</button>
                </div>
            </div>

        </div>
    </div>
</template>
