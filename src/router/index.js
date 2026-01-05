import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'

// Vistas
import CallbackView from '@/views/CallbackView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AgencyView from '@/views/admin/agencies/AgencyView.vue'
import InventoryView from '@/views/admin/inventory/InventoryView.vue'
import CategoryView from '@/views/admin/inventory/CategoryView.vue'
import SoftwareInventoryView from '@/views/admin/software-inventory/SoftwareInventoryView.vue'
import EventsManagerView from '@/views/admin/events/EventsManagerView.vue'
import EventCategoryView from '@/views/admin/events/EventCategoryView.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. RUTAS PÚBLICAS
    {
      path: '/',
      redirect: '/admin/dashboard'
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallbackView
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView
    },

    // 2. RUTAS PROTEGIDAS
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, role: 'Super Admin' },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Sistema de Inventario IT' } // Ejemplo: si necesitara permiso, agregar permission: 'ver_dashboard'
        },
        {
          path: 'agencias',
          name: 'agencias',
          component: AgencyView,
          meta: { title: 'Gestión de Agencias' }
        },
        {
          path: 'inventarios',
          name: 'inventarios',
          component: InventoryView,
          meta: { title: 'Gestión de Inventarios' }
        },
        {
          path: 'categorias',
          name: 'categorias',
          component: CategoryView,
          meta: { title: 'Gestión de Categorías' }
        },
        {
          path: 'inventario-software',
          name: 'inventario-software',
          component: SoftwareInventoryView,
          meta: { title: 'Inventario de Software' }
        },
        {
          path: 'calendario',
          name: 'events-calendar',
          component: EventsManagerView,
          meta: { title: 'Calendario de Eventos' }
        },
        {
          path: 'calendario/categorias',
          name: 'event-categories',
          component: EventCategoryView,
          meta: { title: 'Categorías de Eventos' }
        }
      ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// --- GUARDIA DE NAVEGACIÓN ---
// --- GUARDIA DE NAVEGACIÓN ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 0. Si vamos al Callback (Legacy) o Unauthorized, dejamos pasar SIEMPRE
  // Nota: Con la lógica anterior, el 'CallbackView' ya casi no se usará si entra por aquí,
  // pero lo dejamos por compatibilidad o fallback explícito.
  if (to.name === 'callback' || to.name === 'unauthorized') {
    return next()
  }

  const isAuthenticated = !!authStore.token

  // Caso 1: Ruta requiere Auth y no tenemos token
  if (to.matched.some(record => record.meta.requiresAuth) || to.path === '/') {
    if (!isAuthenticated) {
      console.log("🔒 Acceso Hija: Usuario sin sesión. Iniciando flujo SSO...");
      authStore.login();
      // login() redirige a ventana completa, así que paramos aquí (aunque en SPA 'return' es suficiente)
      return;
    }
  }

  // Caso 2: Estamos autenticados, verificar identidad y permisos
  if (isAuthenticated) {
    // Asegurar que el usuario esté cargado
    if (!authStore.isReady) {
      try {
        await authStore.fetchUser();
      } catch {
        // Si falla, el store ya maneja el logout, pero detenemos navegación
        return;
      }
    }


    // Verificar Rol
    if (to.meta.role && !authStore.hasRole(to.meta.role)) {
      // Usuario logueado pero SIN ROL -> Redirigir a App Madre
      const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';

      console.warn(`⛔ Acceso denegado: Usuario no tiene el rol '${to.meta.role}'. Redirigiendo a App Madre...`);
      window.location.href = `${motherAppUrl}/apps`;
      return;
    }
  }

  next()
})

export default router
