<script setup>
import { reactive, ref, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import EventService from '@/services/events/EventService';

const props = defineProps({
    initialView: {
        type: String,
        default: 'dayGridMonth'
    },
    height: {
        type: String,
        default: 'auto'
    },
    refreshTrigger: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['dateClick', 'eventClick', 'eventDrop', 'eventResize']);

const calendarRef = ref(null);

// Watch for external refresh trigger
watch(() => props.refreshTrigger, () => {
    if (calendarRef.value) {
        calendarRef.value.getApi().refetchEvents();
    }
});

const calendarOptions = reactive({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: props.initialView,
    locale: esLocale,
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    editable: true,
    selectable: true,
    dayMaxEvents: 5, // Aumentamos para que se vean más pines antes de agrupar
    height: props.height,

    events: async (fetchInfo, successCallback, failureCallback) => {
        try {
            const params = {
                start_date: fetchInfo.startStr,
                end_date: fetchInfo.endStr
            };
            const response = await EventService.getAll(params);

            const events = response.data.data.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                backgroundColor: event.color,
                borderColor: event.color,
                textColor: event.text_color,
                allDay: event.is_all_day,
                extendedProps: {
                    description: event.description,
                    location: event.location,
                    category: event.category,
                    user: event.user,
                    rawStart: event.start,
                    rawEnd: event.end
                }
            }));
            successCallback(events);
        } catch (error) {
            console.error(error);
            failureCallback(error);
        }
    },

    eventContent: (arg) => {
        const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
        
        // Buscamos el usuario en el evento o en su categoría
        const user = arg.event.extendedProps.user || arg.event.extendedProps.category?.user;
        const color = arg.event.backgroundColor || '#3b82f6';
        let avatarUrl = user?.avatar;
        
        // Si el avatar es una ruta relativa, le pegamos la URL de la Madre
        if (avatarUrl && !avatarUrl.startsWith('http')) {
            avatarUrl = `${MOTHER_API_URL}${avatarUrl}`;
        } else if (!avatarUrl) {
            avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U');
        }
        
        let container = document.createElement('div');
        container.className = 'flex items-center gap-1.5 p-1 w-full overflow-visible';
        
        // --- MAP PIN WRAPPER (Floating Effect) ---
        let pinWrapper = document.createElement('div');
        pinWrapper.className = 'relative flex flex-col items-center shrink-0 group z-20';

        // Pin Head (Optimized Circle)
        let pinHead = document.createElement('div');
        pinHead.className = 'w-9 h-9 rounded-full border-2 shadow-lg flex items-center justify-center overflow-hidden bg-white transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110 hover:z-50';
        pinHead.style.borderColor = color;

        let img = document.createElement('img');
        img.src = avatarUrl;
        img.className = 'w-full h-full object-cover';
        img.onerror = () => { img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U'); };
        
        pinHead.appendChild(img);
        
        // Pin Tail
        let pinTail = document.createElement('div');
        pinTail.className = 'w-2 h-2 -mt-1 rotate-45 border-r-2 border-b-2 bg-white';
        pinTail.style.borderColor = color;

        pinWrapper.appendChild(pinHead);
        pinWrapper.appendChild(pinTail);
        
        // --- TEXT LABEL (Floating Bubble) ---
        let textContainer = document.createElement('div');
        textContainer.className = 'flex flex-col min-w-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm max-w-[80px]';
        
        let title = document.createElement('span');
        title.innerText = arg.event.title;
        title.className = 'text-[10px] font-bold truncate leading-tight text-gray-800 dark:text-gray-100';

        textContainer.appendChild(title);
        
        container.appendChild(pinWrapper);
        container.appendChild(textContainer);
        
        return { domNodes: [container] };
    },

    select: (selectInfo) => emit('dateClick', selectInfo),
    eventClick: (clickInfo) => emit('eventClick', clickInfo),
    eventDrop: (dropInfo) => emit('eventDrop', dropInfo),
    eventResize: (resizeInfo) => emit('eventResize', resizeInfo)
});
</script>

<template>
    <div class="calendar-wrapper">
        <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>
</template>

<style>
/* Custom FullCalendar Styles for Dark Mode Compatibility */
.calendar-wrapper {
    --fc-border-color: #e5e7eb;
    --fc-button-text-color: #374151;
    --fc-button-bg-color: #ffffff;
    --fc-button-border-color: #d1d5db;
    --fc-button-hover-bg-color: #f3f4f6;
    --fc-button-hover-border-color: #d1d5db;
    --fc-button-active-bg-color: #e5e7eb;
    --fc-button-active-border-color: #d1d5db;
    --fc-event-bg-color: transparent;
    --fc-event-border-color: transparent;
    --fc-today-bg-color: rgba(59, 130, 246, 0.05);
}

.dark .calendar-wrapper {
    --fc-border-color: #374151;
    --fc-button-text-color: #e5e7eb;
    --fc-button-bg-color: #1f2937;
    --fc-button-border-color: #4b5563;
    --fc-button-hover-bg-color: #374151;
    --fc-button-hover-border-color: #4b5563;
    --fc-button-active-bg-color: #4b5563;
    --fc-button-active-border-color: #4b5563;
    --fc-page-bg-color: #1f2937;
    --fc-neutral-bg-color: #111827;
    --fc-list-event-hover-bg-color: #374151;
    --fc-today-bg-color: rgba(59, 130, 246, 0.1);
}

/* Permitir que los eventos se vean como PINS FLOTANTES en FILA */
.fc-daygrid-day-events {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 4px !important;
    padding: 4px !important;
    justify-content: center !important;
    overflow: visible !important;
}

.fc-daygrid-event-harness {
    margin: 0 !important;
    flex-shrink: 0 !important;
    overflow: visible !important;
}

.fc-v-event, .fc-h-event {
    background-color: transparent !important;
    border: none !important;
    overflow: visible !important;
    box-shadow: none !important;
}

.fc-daygrid-event {
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
}

.fc-event-main {
    overflow: visible !important;
    padding: 0 !important;
}

/* Evitar que el día tape los pines */
.fc-daygrid-day-frame {
    overflow: visible !important;
}

.fc .fc-toolbar-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: inherit;
}

.fc .fc-col-header-cell-cushion {
    color: inherit;
    text-transform: capitalize;
}

.fc .fc-daygrid-day-number {
    color: inherit;
    text-decoration: none;
}

.fc .fc-list-day-cushion,
.fc .fc-list-event:hover td {
    background-color: transparent;
}
</style>
