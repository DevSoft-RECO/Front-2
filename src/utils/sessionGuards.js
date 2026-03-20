import { useAuthStore } from '@/stores/auth';

/**
 * Guardianes Silenciosos
 * Ejecuta validaciones periódicas para asegurar que la sesión siga viva en la Madre.
 */
export function setupSessionGuards() {
  const authStore = useAuthStore();

  // 1. Verificación inicial al cargar
  authStore.checkAuth();

  // 2. Heartbeat cada 5 minutos
  // Si la Madre revoca el token, el interceptor de Axios o fetchUser() tirarán la sesión local.
  setInterval(() => {
    if (authStore.token) {
      console.log('[SessionGuard] Ejecutando sincronización silenciosa...');
      authStore.fetchUser();
    }
  }, 5 * 60 * 1000);

  // 3. Sincronización entre Pestañas
  window.addEventListener('storage', (event) => {
    if (event.key === 'access_token') {
      if (!event.newValue) {
        // Alguien borró el token (Logout en otra pestaña)
        authStore.logout();
      } else {
        // Token actualizado (Login en otra pestaña)
        location.reload();
      }
    }
  });
}
