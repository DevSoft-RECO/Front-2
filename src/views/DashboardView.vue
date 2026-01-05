<template>
    <div class="space-y-6 animate-fade-in-up">

      <!-- Welcome Card -->
      <div v-if="authStore.user" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                  Hola, <span class="text-azul-cope">{{ authStore.user.name }}</span>
              </h2>
              <p class="text-gray-500 dark:text-gray-400 mt-1">
                  Bienvenido a la App de Inventario IT. Tu rol es: <span class="font-semibold">{{ userRole }}</span>
              </p>
          </div>
          <div class="mt-4 md:mt-0">
             <!-- Podríamos poner algo aquí -->
          </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Inventario General -->
        <RouterLink to="/admin/inventarios" class="cursor-pointer group">
            <div class="p-6 rounded-xl shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:border-azul-cope h-full">
            <div class="flex items-center justify-between">
                <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Activos</p>
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-azul-cope transition-colors">Inventario General</h3>
                </div>
                <div class="p-3 rounded-lg bg-blue-50 text-azul-cope dark:bg-blue-900/20 dark:text-blue-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                </div>
            </div>
            </div>
        </RouterLink>

        <!-- Inventario Software -->
        <RouterLink to="/admin/inventario-software" class="cursor-pointer group">
            <div class="p-6 rounded-xl shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:border-azul-cope h-full">
            <div class="flex items-center justify-between">
                <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Licencias</p>
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-azul-cope transition-colors">Inv. Software</h3>
                </div>
                <div class="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
            </div>
            </div>
        </RouterLink>

        <!-- Portal Principal -->
        <a @click="returnToPortal" class="cursor-pointer group">
            <div class="p-6 rounded-xl shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:border-azul-cope h-full">
            <div class="flex items-center justify-between">
                <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Sistema</p>
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-azul-cope transition-colors">Portal Principal</h3>
                </div>
                <div class="p-3 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
            </div>
            </div>
        </a>
      </div>


      <!-- Calendar Widget -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <svg class="w-5 h-5 text-azul-cope" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Agenda de Actividades
              </h3>
              <RouterLink to="/admin/calendario" class="text-sm text-azul-cope hover:underline font-medium">Ver Todo</RouterLink>
          </div>
          <div class="overflow-hidden">
             <EventCalendar
                initialView="dayGridMonth"
                height="500px"
                :refresh-trigger="refreshTrigger"
                @eventClick="handleEventClick"
            />
          </div>
      </div>

       <EventDetailsModal
            :isOpen="showModal"
            :item="selectedEvent"
            @close="showModal = false"
            @delete="handleDelete"
        />

    </div>

</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import EventCalendar from '@/views/admin/events/components/EventCalendar.vue';
import EventDetailsModal from '@/views/admin/events/components/EventDetailsModal.vue';
import EventService from '@/services/events/EventService';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const showModal = ref(false);
const selectedEvent = ref(null);
const refreshTrigger = ref(0);

const userRole = computed(() => {
    if (authStore.user?.roles && authStore.user.roles.length > 0) {
        return authStore.user.roles[0];
    }
    return authStore.user?.puesto || 'Invitado';
});


// === LÓGICA DE RETORNO ===
const returnToPortal = () => {
    // Obtenemos la URL de la madre desde el .env
    const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';

    // Redirigimos al Dashboard de la Madre
    window.location.href = `${motherAppUrl}/admin/dashboard`;
}

// Event Handling
const handleEventClick = (clickInfo) => {
    const props = clickInfo.event.extendedProps;
    selectedEvent.value = {
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        is_all_day: clickInfo.event.allDay,
        event_category_id: props.category?.id,
        category_name: props.category?.name,
        category_color: props.category?.color,
        category_text_color: props.category?.text_color,
        description: props.description,
        location: props.location
    };
    showModal.value = true;
};

const refreshCalendar = () => {
    refreshTrigger.value++;
};



const handleDelete = async (id) => {
    try {
        const res = await Swal.fire({
            title: '¿Eliminar evento?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (res.isConfirmed) {
            await EventService.delete(id);
            showModal.value = false;
            refreshCalendar();
             Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo eliminar', 'error');
    }
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
