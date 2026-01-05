<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    isOpen: Boolean,
    item: Object // null -> Create, Object -> Edit
});

const emit = defineEmits(['close', 'save']);

const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all";

const form = ref({
    name: '',
    color: '#3b82f6', // Default blue
    text_color: '#ffffff'
});

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.item) {
            form.value = { ...props.item };
        } else {
            form.value = { name: '', color: '#3b82f6', text_color: '#ffffff' };
        }
    }
});

const handleSubmit = () => {
    emit('save', form.value);
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm flex flex-col">

            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {{ item ? 'Editar Categoría' : 'Nueva Categoría' }}
                </h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div class="p-6 space-y-4">
                <form @submit.prevent="handleSubmit">
                    <div class="mb-3">
                        <label :class="labelClass">Nombre</label>
                        <input v-model="form.name" type="text" :class="inputClass" required>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <label :class="labelClass">Color Fondo</label>
                            <input v-model="form.color" type="color" class="w-full h-10 p-0 border-0 rounded cursor-pointer">
                        </div>
                         <div>
                            <label :class="labelClass">Color Texto</label>
                            <input v-model="form.text_color" type="color" class="w-full h-10 p-0 border-0 rounded cursor-pointer">
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="mb-3">
                        <label :class="labelClass">Vista Previa</label>
                        <div
                            class="px-3 py-2 rounded text-sm font-medium text-center shadow-sm"
                            :style="{ backgroundColor: form.color, color: form.text_color }"
                        >
                            {{ form.name || 'Ejemplo de Categoría' }}
                        </div>
                    </div>
                </form>
            </div>

            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button @click="$emit('close')" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
                <button @click="handleSubmit" class="px-4 py-2 text-sm bg-azul-cope hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/30">Guardar</button>
            </div>

        </div>
    </div>
</template>
