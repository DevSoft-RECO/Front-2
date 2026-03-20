import api from '../api/axios';
import Swal from 'sweetalert2';

export const startSessionGuards = () => {
  // ----------------------------------------------------
  // REGLA A: EL "HEARTBEAT" CADA 5 MINUTOS (Vigilante)
  // ----------------------------------------------------
  setInterval(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Un sub-proceso silencioso al Backend Local (que valida con la Madre)
      // Usamos el cliente 'api' que ya tiene el puerto 8001 configurado
      api.get('/me')
        .catch(() => console.log('El heartbeat detectó sesión caída.'));
    }
  }, 5 * 60 * 1000);

  // ----------------------------------------------------
  // REGLA B: AVISO CORTÉS DE CIERRE DE JORNADA (17:50 hrs)
  // ----------------------------------------------------
  const now = new Date();
  const alertTime = new Date();
  alertTime.setHours(17, 50, 0, 0);
  
  if (now < alertTime) {
    const msUntilAlert = alertTime.getTime() - now.getTime();
    setTimeout(() => {
      if (localStorage.getItem('access_token')) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: 'Jornada por finalizar',
          text: 'Tu sesión se cerrará irremediablemente a las 6:00 PM.',
          timer: 60000
        });
      }
    }, msUntilAlert);
  }

  // REGLA C: Sincronización entre Pestañas (Logout global)
  window.addEventListener('storage', (event) => {
    if (event.key === 'access_token' && !event.newValue) {
      // Alguien borró el token en otra pestaña
      location.reload();
    }
  });
};
