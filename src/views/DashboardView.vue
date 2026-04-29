<template>
    <div class="space-y-6 animate-fade-in-up">

      <!-- Top Actions Grid (3 cards in a row) -->
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
      </div>

      <!-- Expanded Calendar Widget -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-6">
              <div>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <svg class="w-6 h-6 text-azul-cope" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Agenda de Actividades
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Visualiza y gestiona las tareas programadas</p>
              </div>
              <RouterLink to="/admin/calendario" class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">Gestionar Calendario</RouterLink>
          </div>
          <div class="overflow-hidden">
             <EventCalendar
                initialView="dayGridMonth"
                height="700px"
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
import { ref } from 'vue';
import EventCalendar from '@/views/admin/events/components/EventCalendar.vue';
import EventDetailsModal from '@/views/admin/events/components/EventDetailsModal.vue';
import EventService from '@/services/events/EventService';
import Swal from 'sweetalert2';

const showModal = ref(false);
const selectedEvent = ref(null);
const refreshTrigger = ref(0);




// Event Handling
const handleEventClick = (clickInfo) => {
    const props = clickInfo.event.extendedProps;
    selectedEvent.value = {
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: props.rawStart || clickInfo.event.startStr,
        end: props.rawEnd || clickInfo.event.endStr,
        is_all_day: clickInfo.event.allDay,
        event_category_id: props.category?.id,
        category_name: props.category?.name,
        category_color: props.category?.color,
        category_text_color: props.category?.text_color,
        description: props.description,
        location: props.location,
        user: props.user,
        category: props.category
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
