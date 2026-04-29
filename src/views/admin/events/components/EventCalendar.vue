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
    dayMaxEvents: true,
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
    --fc-event-bg-color: #3b82f6;
    --fc-event-border-color: #3b82f6;
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
