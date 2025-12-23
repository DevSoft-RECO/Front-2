// src/stores/layout.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // --- STATE ---
  const isSidebarOpen = ref(false)
  // CAMBIO 1: Iniciamos en 'true' por defecto para evitar parpadeos visuales al cargar
  const isCollapsed = ref(true) 
  const isDark = ref(false)

  // --- ACTIONS ---
  
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function closeSidebar() {
    isSidebarOpen.value = false
  }

  function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value
    // Guardamos la preferencia manual solo si es pantalla grande
    if (window.innerWidth >= 1024) {
        localStorage.setItem('sidebar_collapsed', isCollapsed.value)
    }
  }

  // --- LÓGICA RESPONSIVA ---
  function handleResize() {
    const width = window.innerWidth

    if (width < 768) {
        // MÓVIL: Sidebar cerrado por defecto (overlay oculto)
        isSidebarOpen.value = false 
        // En móvil reseteamos el colapsado visual interno para que
        // cuando se abra el menú, se vea completo y no chiquito.
        isCollapsed.value = false 
    } 
    else if (width >= 768 && width < 1024) {
        // TABLET: Forzamos colapsado (solo iconos) para ahorrar espacio
        isCollapsed.value = true
        isSidebarOpen.value = false 
    } 
    else {
        // ESCRITORIO GRANDE (> 1024px)
        const storedCollapse = localStorage.getItem('sidebar_collapsed')
        
        // CAMBIO 2: LÓGICA DE PREFERENCIA
        if (storedCollapse === null) {
            // Si el usuario NUNCA ha tocado el botón (es nuevo), 
            // forzamos que esté CONTRAÍDO por defecto.
            isCollapsed.value = true
        } else {
            // Si ya tiene una preferencia guardada, la respetamos.
            isCollapsed.value = storedCollapse === 'true'
        }
    }
  }

  // --- TEMA (Igual que antes) ---
  function toggleTheme() {
    isDark.value = !isDark.value
    updateDOMAndStorage()
  }

  function updateDOMAndStorage() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  function initTheme() {
    // 1. Tema
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      isDark.value = storedTheme === 'dark'
    } else {
      isDark.value = shouldBeDarkAutomatic()
    }

    if (isDark.value) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')

    // 2. Ejecutar resize inicial para aplicar el colapsado por defecto
    handleResize()
    
    // 3. Listener para cambios de tamaño en vivo
    window.addEventListener('resize', handleResize)
  }

  function shouldBeDarkAutomatic() {
    const guatemalaTime = new Date().toLocaleString("en-US", { timeZone: "America/Guatemala" })
    const hour = new Date(guatemalaTime).getHours()
    const isNightTime = hour >= 18 || hour < 6
    const prefersDarkSystem = window.matchMedia("(prefers-color-scheme: dark)").matches
    return isNightTime || prefersDarkSystem
  }

  return {
    isSidebarOpen,
    isCollapsed,
    isDark,
    toggleSidebar,
    closeSidebar,
    toggleCollapse,
    toggleTheme,
    initTheme,
    handleResize
  }
})