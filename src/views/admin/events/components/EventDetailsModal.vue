<script setup>
defineProps({
    isOpen: Boolean,
    item: Object
});

defineEmits(['close', 'delete']);

const formatDate = (dateStr, isAllDay = false) => {
    if (!dateStr) return '';
    // Extraemos los componentes de la fecha manualmente para ignorar zonas horarias
    // y tratar la información del servidor como literal.
    const parts = dateStr.match(/(\d{4})-(\d{2})-(\d{2})[T ]?(\d{2})?:?(\d{2})?/);
    if (!parts) return dateStr;

    const [, y, m, d, hh, mm] = parts;

    // Creamos la fecha usando componentes individuales (esto la trata como hora local siempre)
    const date = hh 
        ? new Date(y, m - 1, d, hh, mm) 
        : new Date(y, m - 1, d);

    if (isNaN(date.getTime())) return dateStr;

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    // Mostramos la hora si:
    // 1. Hay horas en el string
    // 2. Y (NO es todo el día O la hora no es 00:00)
    const hasTime = hh && mm;
    const isNotMidnight = parseInt(hh) !== 0 || parseInt(mm) !== 0;

    if (hasTime && (!isAllDay || isNotMidnight)) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('es-ES', options).format(date);
};

// structure: { id, title, start, end, is_all_day, event_category_id, description, location }

const getAvatarUrl = (user) => {
    if (!user) return null;
    const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
    let avatar = user.avatar;
    if (avatar && !avatar.startsWith('http')) {
        return `${MOTHER_API_URL}${avatar}`;
    }
    return avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-fade-in-up">

            <!-- Header with Color Bar if available (hard to get color without category obj, but we could pass it) -->
            <div class="h-2 bg-azul-cope w-full"></div>

            <div class="p-6">
                <!-- Title -->
                <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {{ item?.title }}
                </h3>

                <!-- Category Badge -->
                <div v-if="item?.category_name" class="mb-4">
                    <span
                        class="px-2 py-1 rounded-md text-xs font-bold inline-block"
                        :style="{ backgroundColor: item.category_color || '#3b82f6', color: item.category_text_color || '#ffffff' }"
                    >
                        {{ item.category_name }}
                    </span>
                </div>

                <!-- User Info (Owner) -->
                <div v-if="item?.user || item?.category?.user" class="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <img 
                        :src="getAvatarUrl(item.user || item.category?.user)" 
                        class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                        @error="(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || item.category?.user?.name)}&background=random`"
                    />
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Responsable</p>
                        <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ item.user?.name || item.category?.user?.name }}</p>
                        <p v-if="item.user?.puesto || item.category?.user?.puesto" class="text-[11px] text-gray-500 dark:text-gray-400">{{ item.user?.puesto || item.category?.user?.puesto }}</p>
                    </div>
                </div>

                <!-- Date -->
                <div class="flex items-start gap-3 text-gray-600 dark:text-gray-300 mb-4">
                    <svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <div>
                        <p class="text-sm font-medium">{{ formatDate(item?.start, item?.is_all_day) }}</p>
                        <p v-if="item?.end" class="text-sm text-gray-500">Hasta: {{ formatDate(item?.end, item?.is_all_day) }}</p>
                    </div>
                </div>

                 <!-- Location -->
                <div v-if="item?.location" class="flex items-start gap-3 text-gray-600 dark:text-gray-300 mb-4">
                     <svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p class="text-sm">{{ item.location }}</p>
                </div>

                <!-- Description -->
                <div v-if="item?.description" class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {{ item.description }}
                </div>
            </div>

            <!-- Actions -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                <button
                    @click="$emit('delete', item.id)"
                    class="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Eliminar
                </button>

                <button
                    @click="$emit('close')"
                    class="bg-white dark:bg-gray-600 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
                >
                    Cerrar
                </button>
            </div>

        </div>
    </div>
</template>
