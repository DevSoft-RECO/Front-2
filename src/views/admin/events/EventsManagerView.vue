<script setup>
import { ref } from 'vue';
import AdminContent from '@/components/layout/AdminContent.vue';
import EventService from '@/services/events/EventService';
import EventModal from './components/EventModal.vue';
import EventCalendar from './components/EventCalendar.vue';
import Swal from 'sweetalert2';

const showModal = ref(false);
const selectedEvent = ref(null);
const refreshTrigger = ref(0); // Trigger to reload calendar events

// Methods
const handleDateSelect = (selectInfo) => {
    selectedEvent.value = {
        id: null,
        title: '',
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        is_all_day: selectInfo.allDay,
        event_category_id: null
    };
    showModal.value = true;
};

const handleEventClick = (clickInfo) => {
    const props = clickInfo.event.extendedProps;
    selectedEvent.value = {
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        is_all_day: clickInfo.event.allDay,
        event_category_id: props.category?.id,
        description: props.description,
        location: props.location
    };
    showModal.value = true;
};

const handleEventDrop = async (dropInfo) => {
    await updateEventDate(dropInfo.event);
};

const handleEventResize = async (resizeInfo) => {
    await updateEventDate(resizeInfo.event);
};

const updateEventDate = async (apiEvent) => {
    try {
        await EventService.update(apiEvent.id, {
            start: apiEvent.start.toISOString(),
            end: apiEvent.end?.toISOString() || apiEvent.start.toISOString(),
            is_all_day: apiEvent.allDay
        });
        // Silent success
    } catch (error) {
        console.error(error);
        apiEvent.revert();
        Swal.fire('Error', 'No se pudo mover el evento', 'error');
    }
};

const refreshCalendar = () => {
    refreshTrigger.value++;
};

const openCreateModal = () => {
    selectedEvent.value = {
        id: null,
        title: '',
        start: new Date().toISOString().substring(0, 16), // Current time for new event
        end: '',
        is_all_day: false,
        event_category_id: null
    };
    showModal.value = true;
};

const handleSave = async (formData) => {
    try {
        if (formData.id) {
            await EventService.update(formData.id, formData);
        } else {
            await EventService.create(formData);
        }
        showModal.value = false;
        refreshCalendar();
        Swal.fire({
            icon: 'success',
            title: 'Guardado',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo guardar el evento', 'error');
    }
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

<template>
    <AdminContent title="Calendario" subtitle="Gestión de eventos y actividades">

        <!-- Header Actions -->
        <div class="mb-6 flex justify-end">
            <button
                @click="openCreateModal"
                class="bg-azul-cope hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2"
            >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Nuevo Evento
            </button>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
            <EventCalendar
                :refresh-trigger="refreshTrigger"
                @dateClick="handleDateSelect"
                @eventClick="handleEventClick"
                @eventDrop="handleEventDrop"
                @eventResize="handleEventResize"
            />
        </div>

        <EventModal
            :isOpen="showModal"
            :item="selectedEvent"
            @close="showModal = false"
            @save="handleSave"
            @delete="handleDelete"
        />
    </AdminContent>
</template>
