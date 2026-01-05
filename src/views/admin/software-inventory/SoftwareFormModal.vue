<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    isOpen: Boolean,
    item: Object // null -> Create, Object -> Edit
});

const emit = defineEmits(['close', 'save']);

// Common Tailwind Classes
const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all";

const form = ref({
    nombre: '',
    enlace: '',
    descripcion: '',
    tipo: '',
    usuario: '',
    clave: ''
});

// Tipos de software sugeridos (puedes ajustar)
const softwareTypes = ['Ofimática', 'Diseño', 'Desarrollo', 'Utilidades', 'Seguridad', 'Otro'];

// Reset or Populate Form
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.item) {
            form.value = { ...props.item };
        } else {
            resetForm();
        }
    }
});

const resetForm = () => {
    form.value = {
        nombre: '', enlace: '', descripcion: '', tipo: '', usuario: '', clave: ''
    };
};

const handleSubmit = () => {
    emit('save', form.value);
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {{ item ? 'Editar Software' : 'Nuevo Software' }}
                </h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto space-y-4">
                <form @submit.prevent="handleSubmit">

                    <div class="mb-3">
                        <label :class="labelClass">Nombre Software *</label>
                        <input v-model="form.nombre" type="text" :class="inputClass" required placeholder="Ej: Microsoft Office">
                    </div>

                    <div class="mb-3">
                         <label :class="labelClass">Tipo</label>
                         <input v-model="form.tipo" type="text" list="typeSuggestions" :class="inputClass" placeholder="Ej: Ofimática">
                         <datalist id="typeSuggestions">
                             <option v-for="t in softwareTypes" :key="t" :value="t" />
                         </datalist>
                    </div>

                    <div class="mb-3">
                        <label :class="labelClass">Enlace de Acceso / Descarga</label>
                        <input v-model="form.enlace" type="url" :class="inputClass" placeholder="https://...">
                    </div>

                    <div class="mb-3 grid grid-cols-2 gap-4">
                        <div>
                             <label :class="labelClass">Usuario / Email</label>
                             <input v-model="form.usuario" type="text" :class="inputClass">
                        </div>
                        <div>
                             <label :class="labelClass">Clave</label>
                             <input v-model="form.clave" type="text" :class="inputClass">
                        </div>
                    </div>

                     <div class="mb-3">
                        <label :class="labelClass">Descripción</label>
                        <textarea v-model="form.descripcion" rows="3" :class="inputClass"></textarea>
                    </div>

                </form>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                <button @click="$emit('close')" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
                <button @click="handleSubmit" class="px-6 py-2 bg-azul-cope hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/30">Guardar</button>
            </div>

        </div>
    </div>
</template>
