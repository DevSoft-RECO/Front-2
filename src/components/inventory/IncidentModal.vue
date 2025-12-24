<script setup>
import { ref, watch } from 'vue';
import IncidentService from '@/services/inventory/IncidentService';
import Swal from 'sweetalert2';

const props = defineProps({
    isOpen: Boolean,
    inventoryId: Number, // ID of the inventory item
    inventoryCode: String // For display purpose
});

const emit = defineEmits(['close']);

const incidents = ref([]);
const loading = ref(false);
const showAddForm = ref(false);

const newIncident = ref({
    tipo: 'Falla',
    descripcion: '',
    fecha_reporte: new Date().toISOString().split('T')[0]
});

// Load incidents when modal opens
watch(() => props.isOpen, async (newVal) => {
    if (newVal && props.inventoryId) {
        showAddForm.value = false;
        await loadIncidents();
    }
});

const loadIncidents = async () => {
    loading.value = true;
    try {
        const res = await IncidentService.getByInventory(props.inventoryId);
        incidents.value = res.data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el historial de incidentes', 'error');
    } finally {
        loading.value = false;
    }
};

const handleAddIncident = async () => {
    if (!newIncident.value.descripcion) return Swal.fire('Error', 'La descripción es obligatoria', 'warning');

    try {
        await IncidentService.create({
            inventario_id: props.inventoryId,
            ...newIncident.value
        });

        Swal.fire('Registrado', 'Incidente registrado correctamente', 'success');

        // Reset form and reload list
        newIncident.value = { tipo: 'Falla', descripcion: '', fecha_reporte: new Date().toISOString().split('T')[0] };
        showAddForm.value = false;
        loadIncidents();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo registrar el incidente', 'error');
    }
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 rounded-t-xl shrink-0">
                <div>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Historial de Incidentes</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Activo: <span class="font-mono font-medium text-azul-cope">{{ inventoryCode }}</span></p>
                </div>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6">

                <!-- Toggle Form Button -->
                <div class="mb-4 flex justify-end" v-if="!showAddForm">
                    <button
                        @click="showAddForm = true"
                        class="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 font-medium"
                    >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        Reportar Nuevo Incidente
                    </button>
                </div>

                <!-- Add Form -->
                <div v-if="showAddForm" class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600 animate-fade-in-down">
                    <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">Nuevo Reporte</h4>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
                            <select v-model="newIncident.tipo" class="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-red-500">
                                <option value="Falla">Falla</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Robo/Pérdida">Robo/Pérdida</option>
                                <option value="Cambio Asignación">Cambio Asignación</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                         <div>
                            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
                            <input type="date" v-model="newIncident.fecha_reporte" class="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-red-500">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción del Suceso</label>
                        <textarea v-model="newIncident.descripcion" rows="3" class="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-red-500"></textarea>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button @click="showAddForm = false" class="text-xs text-gray-500 hover:text-gray-700 underline">Cancelar</button>
                        <button @click="handleAddIncident" class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition-colors">Guardar Reporte</button>
                    </div>
                </div>

                <!-- Timeline / List -->
                <div v-if="loading" class="text-center py-8 text-gray-500">Cargando historial...</div>

                <div v-else-if="incidents.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <p class="text-gray-500 dark:text-gray-400">Este activo no ha reportado incidentes.</p>
                </div>

                <ul v-else class="space-y-4">
                    <li v-for="inc in incidents" :key="inc.id" class="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 pb-4 last:pb-0">
                        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-red-500"></div>

                        <div class="text-sm">
                            <div class="flex justify-between items-start">
                                <span class="font-bold text-gray-800 dark:text-gray-200">{{ inc.tipo }}</span>
                                <span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                    {{ new Date(inc.fecha_reporte).toLocaleDateString() }}
                                </span>
                            </div>
                            <p class="mt-1 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-100 dark:border-gray-700">
                                {{ inc.descripcion }}
                            </p>
                        </div>
                    </li>
                </ul>

            </div>

             <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl shrink-0 flex justify-end">
                 <button
                    @click="$emit('close')"
                    class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
                >
                    Cerrar
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
}
@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
