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
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Sistema de Mercadeo' } // Ejemplo: si necesitara permiso, agregar permission: 'ver_dashboard'
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
      ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// --- GUARDIA DE NAVEGACIÓN ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 0. Si vamos al Callback o Unauthorized, dejamos pasar SIEMPRE
  if (to.name === 'callback' || to.name === 'unauthorized') {
    return next()
  }

  const isAuthenticated = !!authStore.token

  // Caso 1: Ruta requiere Auth y no tenemos token
  if (to.matched.some(record => record.meta.requiresAuth) || to.path === '/') {
    if (!isAuthenticated) {
      console.log("🔒 Acceso Hija: Usuario sin sesión. Iniciando flujo SSO...");
      authStore.login();
      return;
    }
  }

  // Caso 2: Estamos autenticados, verificar identidad y permisos
  if (isAuthenticated) {
    // Asegurar que el usuario esté cargado
    if (!authStore.isReady) {
      try {
        await authStore.fetchUser();
      } catch (error) {
        // Si falla, el store ya maneja el logout, pero detenemos navegación
        return;
      }
    }

    // Verificar permisos específicos de la ruta
    if (to.meta.permission && !authStore.can(to.meta.permission)) {
      return next('/unauthorized');
    }
  }

  next()
})

export default router
