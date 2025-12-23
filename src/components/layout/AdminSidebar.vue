<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="layoutStore.isSidebarOpen"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
      @click="layoutStore.closeSidebar"
    ></div>
  </Transition>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 shadow-2xl
           bg-azul-cope dark:bg-gray-900
           border-r border-transparent dark:border-gray-800"
    :class="[
      layoutStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      layoutStore.isCollapsed ? 'w-20' : 'w-72'
    ]"
  >
    <div class="h-16 flex items-center justify-between px-6 shrink-0
                bg-black/10 dark:bg-black/20 border-b border-white/5 dark:border-gray-800">
      <div v-if="!layoutStore.isCollapsed" class="flex items-center gap-3 fade-in w-full">
        <img src="@/assets/logoyk.svg" alt="YK" class="h-8 w-auto object-contain brightness-0 invert" />
        <span class="font-bold text-lg tracking-wider uppercase text-white dark:text-gray-100">
            Yaman Kutx
        </span>
      </div>
      <div v-else class="w-full flex justify-center fade-in">
        <img src="@/assets/logoyk.svg" alt="YK" class="h-8 w-8 object-contain brightness-0 invert" />
      </div>
    </div>

    <nav
      class="flex-1 py-6 px-3 space-y-2 custom-scrollbar"
      :class="layoutStore.isCollapsed ? 'overflow-visible' : 'overflow-y-auto'"
    >
      <template v-for="item in menuItems" :key="item.id">

        <div v-if="!item.children" class="relative group">
            <RouterLink
            :to="item.route"
            @click="handleItemClick"
            class="flex items-center px-3 py-3 rounded-lg transition-all duration-200 group border-l-4"
            :class="[
                isActive(item.route)
                ? 'bg-white/10 dark:bg-gray-800 border-verde-cope text-white dark:text-verde-cope shadow-lg'
                : 'border-transparent text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800 hover:text-white dark:hover:text-gray-100',
                layoutStore.isCollapsed ? 'justify-center pl-0 border-l-0' : ''
            ]"
            >
                <span class="shrink-0 transition-colors duration-200"
                      :class="isActive(item.route) ? 'text-verde-cope' : 'group-hover:text-verde-cope'">
                    <svg v-html="item.iconSvg" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"></svg>
                </span>

                <span v-if="!layoutStore.isCollapsed" class="ml-3 font-medium truncate">
                    {{ item.label }}
                </span>
            </RouterLink>

            <div
                v-if="layoutStore.isCollapsed"
                class="absolute left-full top-0 ml-2 px-3 py-2 bg-verde-cope text-white text-sm font-bold rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none"
                style="width: max-content;"
            >
                {{ item.label }}
                <div class="absolute top-3 -left-1 w-2 h-2 bg-verde-cope transform rotate-45"></div>
            </div>
        </div>

        <div v-else class="relative group">
            <button
                @click="handleGroupClick(item.id)"
                class="w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group border-l-4 border-transparent"
                :class="[
                    openGroups.includes(item.id) && !layoutStore.isCollapsed
                    ? 'bg-black/20 dark:bg-black/40 text-white dark:text-gray-100'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800 hover:text-white',
                    layoutStore.isCollapsed ? 'justify-center pl-0' : 'justify-between'
                ]"
            >
                <div class="flex items-center">
                    <span class="shrink-0 transition-colors" :class="openGroups.includes(item.id) ? 'text-verde-cope' : 'group-hover:text-verde-cope'">
                        <svg v-html="item.iconSvg" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"></svg>
                    </span>
                    <span v-if="!layoutStore.isCollapsed" class="ml-3 font-medium truncate">{{ item.label }}</span>
                </div>

                <svg
                    v-if="!layoutStore.isCollapsed"
                    class="w-4 h-4 transition-transform duration-300"
                    :class="openGroups.includes(item.id) ? 'text-verde-cope rotate-180' : 'text-gray-400'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div
                v-if="layoutStore.isCollapsed"
                class="absolute left-full top-0 ml-3 w-56 bg-azul-cope dark:bg-gray-800 border border-white/10 dark:border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 origin-top-left p-2 overflow-hidden"
            >
                 <div class="px-3 py-2 text-xs font-bold text-verde-cope uppercase tracking-wider border-b border-white/10 dark:border-gray-700 mb-1">
                    {{ item.label }}
                 </div>

                 <RouterLink
                  v-for="child in item.children"
                  :key="child.route"
                  :to="child.route"
                  @click="handleItemClick"
                  class="block px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="isActive(child.route)
                    ? 'bg-white/10 dark:bg-gray-700 text-white font-medium'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-700 hover:text-white'"
                >
                  {{ child.label }}
                </RouterLink>

                 <div class="absolute top-4 -left-1.5 w-3 h-3 bg-azul-cope dark:bg-gray-800 border-l border-b border-white/10 dark:border-gray-700 transform rotate-45"></div>
            </div>

            <div
                v-if="openGroups.includes(item.id) && !layoutStore.isCollapsed"
                class="mt-1 ml-4 pl-4 border-l border-white/20 dark:border-gray-700 space-y-1"
            >
                <RouterLink
                    v-for="child in item.children"
                    :key="child.route"
                    :to="child.route"
                    @click="handleItemClick"
                    class="block px-3 py-2 rounded-md text-sm transition-colors duration-200"
                    :class="isActive(child.route)
                        ? 'text-verde-cope font-bold'
                        : 'text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300'"
                >
                    {{ child.label }}
                </RouterLink>
            </div>
        </div>
      </template>
    </nav>

    <div class="p-4 mt-auto border-t border-white/10 dark:border-gray-800 shrink-0">
        <div v-if="!layoutStore.isCollapsed" class="fade-in text-center">
            <p class="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Desarrollado por</p>
            <p class="text-xs font-bold text-white dark:text-gray-300 tracking-wide">
                Área de Informática <span class="text-verde-cope">2025</span>
            </p>
        </div>
        <div v-else class="flex justify-center fade-in">
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-600 hover:text-verde-cope cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from "@/stores/layout"

const route = useRoute()
const layoutStore = useLayoutStore()
const openGroups = ref([])

// --- NUEVA FUNCIÓN PARA CERRAR EN MÓVIL ---
const handleItemClick = () => {
  // Verificamos si la pantalla es menor a 'md' (768px en Tailwind por defecto)
  // O simplemente llamamos a closeSidebar. Tu CSS se encarga de que
  // en escritorio no se oculte aunque isSidebarOpen sea false.
  if (window.innerWidth < 768) {
      layoutStore.closeSidebar()
  }
}

const menuItems = [
    {
        id: 'home',
        label: 'Dashboard',
        route: '/admin/dashboard',
        iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2v10a1 1 0 01-1 1h-3m-4 0h4" />'
    },
    {
        id: 'administracion',
        label: 'Administración',
        iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
        children: [
            { label: 'Agencias', route: '/admin/agencias' }
        ]
    },
    // Datos de ejemplo para probar submenús
    /*
    {
        id: 'rh', label: 'RRHH', iconSvg: '...',
        children: [ { label: 'Personal', route: '/admin/personal' } ]
    }
    */
]

const isActive = (path) => route.path === path

const handleGroupClick = (id) => {
    if (layoutStore.isCollapsed) return
    if (openGroups.value.includes(id)) {
        openGroups.value = []
    } else {
        openGroups.value = [id]
    }
}
</script>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); border-radius: 20px; }
</style>
