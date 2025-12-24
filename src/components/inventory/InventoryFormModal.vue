<script setup>
import { ref, watch } from 'vue';
import CategoryService from '@/services/inventory/CategoryService';
import AgencyService from '@/services/agency/AgencyService';
import Swal from 'sweetalert2';

const props = defineProps({
    isOpen: Boolean,
    inventoryItem: Object // If null -> Create, else -> Edit
});

const emit = defineEmits(['close', 'save']);

// Common Tailwind Classes (Defined here to avoid @apply issues in scoped CSS with Tailwind v4)
const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-azul-cope focus:border-transparent outline-none transition-all";

const categories = ref([]);
const agencies = ref([]);
const loadingData = ref(false);

const form = ref({
    // Required
    agencia_id: '',
    categoria_id: '',
    codigo_activo: '',
    // Optional
    numero_serie: '',
    area: '',
    nombre_responsable: '',
    puesto_responsable: '',
    usuario_equipo: '',
    password_equipo: '',
    tipo_dispositivo: '',
    activo: true,
    marca: '',
    modelo: '',
    nombre_equipo: '',
    ip_address: '',
    procesador: '',
    memoria_ram: '',
    almacenamiento: '',
    sistema_operativo: '',
    licencia_so: '',
    version_office: '',
    licencia_office: '',
    antivirus: '',
    bloqueo_usb: 'No',
    es_remoto: false,
    observaciones: ''
});

// Reset or Populate Form
watch(() => props.isOpen, async (newVal) => {
    if (newVal) {
        await loadDropdowns();
        if (props.inventoryItem) {
            form.value = { ...props.inventoryItem };
             // Fix booleans if they come as 0/1 from backend
             form.value.activo = !!form.value.activo;
             form.value.es_remoto = !!form.value.es_remoto;
        } else {
            resetForm();
        }
    }
});

const resetForm = () => {
    form.value = {
        agencia_id: '', categoria_id: '', codigo_activo: '',
        numero_serie: '', area: '', nombre_responsable: '', puesto_responsable: '',
        usuario_equipo: '', password_equipo: '', tipo_dispositivo: '',
        activo: true, marca: '', modelo: '', nombre_equipo: '', ip_address: '',
        procesador: '', memoria_ram: '', almacenamiento: '', sistema_operativo: '',
        licencia_so: '', version_office: '', licencia_office: '', antivirus: '',
        bloqueo_usb: 'No', es_remoto: false, observaciones: ''
    };
};

const loadDropdowns = async () => {
    if (categories.value.length > 0 && agencies.value.length > 0) return;

    loadingData.value = true;
    try {
        const [catRes, agencyRes] = await Promise.all([
            CategoryService.getAll(),
            AgencyService.getAll()
        ]);
        categories.value = catRes.data;
        agencies.value = agencyRes.data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error cargando listas desplegables', 'error');
    } finally {
        loadingData.value = false;
    }
};

const handleSubmit = () => {
    // Validaciones básicas
    if (!form.value.agencia_id || !form.value.codigo_activo) {
        return Swal.fire('Atención', 'Agencia y Código Activo son obligatorios', 'warning');
    }
    emit('save', form.value);
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {{ inventoryItem ? 'Editar Activo' : 'Nuevo Activo' }}
                </h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Body (Scrollable) -->
            <div class="p-6 overflow-y-auto">
                <div v-if="loadingData" class="text-center py-10">Cargando datos...</div>

                <form v-else @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <!-- Section: Identificación -->
                    <div class="col-span-full pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                        <h4 class="text-sm font-bold uppercase text-azul-cope tracking-wider">Identificación</h4>
                    </div>

                    <div>
                        <label :class="labelClass">Agencia *</label>
                        <select v-model="form.agencia_id" :class="inputClass">
                            <option value="">Seleccione...</option>
                            <option v-for="a in agencies" :key="a.id" :value="a.id">{{ a.nombre }}</option>
                        </select>
                    </div>

                    <div>
                        <label :class="labelClass">Categoría</label>
                        <select v-model="form.categoria_id" :class="inputClass">
                            <option value="">Seleccione...</option>
                            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                        </select>
                    </div>

                    <div>
                        <label :class="labelClass">Código Activo *</label>
                        <input v-model="form.codigo_activo" type="text" :class="inputClass" placeholder="ACT-001">
                    </div>

                    <!-- Section: Detalles Equipo -->
                    <div class="col-span-full pb-2 border-b border-gray-100 dark:border-gray-700 mb-2 mt-4">
                        <h4 class="text-sm font-bold uppercase text-azul-cope tracking-wider">Detalles del Equipo</h4>
                    </div>

                    <div>
                        <label :class="labelClass">Nombre Equipo (Hostname)</label>
                        <input v-model="form.nombre_equipo" type="text" :class="inputClass">
                    </div>
                     <div>
                        <label :class="labelClass">Tipo Dispositivo</label>
                        <input v-model="form.tipo_dispositivo" type="text" :class="inputClass" placeholder="Laptop, Desktop...">
                    </div>
                    <div>
                        <label :class="labelClass">Marca</label>
                        <input v-model="form.marca" type="text" :class="inputClass">
                    </div>
                    <div>
                        <label :class="labelClass">Modelo</label>
                        <input v-model="form.modelo" type="text" :class="inputClass">
                    </div>
                    <div>
                        <label :class="labelClass">No. Serie</label>
                        <input v-model="form.numero_serie" type="text" :class="inputClass">
                    </div>
                    <div>
                        <label :class="labelClass">IP Address</label>
                        <input v-model="form.ip_address" type="text" :class="inputClass">
                    </div>

                    <!-- Section: Hardware & Software -->
                    <div class="col-span-full pb-2 border-b border-gray-100 dark:border-gray-700 mb-2 mt-4">
                        <h4 class="text-sm font-bold uppercase text-azul-cope tracking-wider">Hardware & Software</h4>
                    </div>

                    <div><label :class="labelClass">Procesador</label><input v-model="form.procesador" type="text" :class="inputClass"></div>
                    <div><label :class="labelClass">RAM</label><input v-model="form.memoria_ram" type="text" :class="inputClass"></div>
                    <div><label :class="labelClass">Almacenamiento</label><input v-model="form.almacenamiento" type="text" :class="inputClass"></div>

                    <div><label :class="labelClass">Sistema Operativo</label><input v-model="form.sistema_operativo" type="text" :class="inputClass"></div>
                     <div><label :class="labelClass">Licencia SO</label><input v-model="form.licencia_so" type="text" :class="inputClass"></div>

                    <div><label :class="labelClass">Versión Office</label><input v-model="form.version_office" type="text" :class="inputClass"></div>
                    <div><label :class="labelClass">Licencia Office</label><input v-model="form.licencia_office" type="text" :class="inputClass"></div>

                    <div><label :class="labelClass">Antivirus</label><input v-model="form.antivirus" type="text" :class="inputClass"></div>
                     <div>
                        <label :class="labelClass">Bloqueo USB</label>
                        <select v-model="form.bloqueo_usb" :class="inputClass">
                            <option value="Si">Sí</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    <!-- Section: Responsable -->
                    <div class="col-span-full pb-2 border-b border-gray-100 dark:border-gray-700 mb-2 mt-4">
                        <h4 class="text-sm font-bold uppercase text-azul-cope tracking-wider">Responsable / Ubicación</h4>
                    </div>

                    <div><label :class="labelClass">Área</label><input v-model="form.area" type="text" :class="inputClass"></div>
                    <div><label :class="labelClass">Nombre Responsable</label><input v-model="form.nombre_responsable" type="text" :class="inputClass"></div>
                    <div><label :class="labelClass">Puesto Responsable</label><input v-model="form.puesto_responsable" type="text" :class="inputClass"></div>
                    <div><label :class="labelClass">Usuario Equipo</label><input v-model="form.usuario_equipo" type="text" :class="inputClass"></div>
                    <div><label :class="labelClass">Password Equipo</label><input v-model="form.password_equipo" type="text" :class="inputClass"></div>

                    <!-- Section: Estado & Otros -->
                    <div class="col-span-full pb-2 border-b border-gray-100 dark:border-gray-700 mb-2 mt-4">
                        <h4 class="text-sm font-bold uppercase text-azul-cope tracking-wider">Estado & Otros</h4>
                    </div>

                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input v-model="form.activo" type="checkbox" class="w-4 h-4 text-azul-cope rounded border-gray-300 focus:ring-azul-cope">
                            <span class="text-sm text-gray-700 dark:text-gray-300">Activo</span>
                        </label>

                        <label class="flex items-center gap-2 cursor-pointer">
                            <input v-model="form.es_remoto" type="checkbox" class="w-4 h-4 text-azul-cope rounded border-gray-300 focus:ring-azul-cope">
                            <span class="text-sm text-gray-700 dark:text-gray-300">Es Remoto</span>
                        </label>
                    </div>

                    <div class="col-span-full">
                         <label :class="labelClass">Observaciones</label>
                         <textarea v-model="form.observaciones" rows="2" :class="inputClass"></textarea>
                    </div>

                </form>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                <button
                    @click="$emit('close')"
                    class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    @click="handleSubmit"
                    class="px-6 py-2 bg-azul-cope hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/30"
                >
                    Guardar Activo
                </button>
            </div>
        </div>
    </div>
</template>
