import Swal from 'sweetalert2';

export const startSessionGuards = () => {
  // ----------------------------------------------------
  // REGLA B: AVISO CORTÉS DE CIERRE DE JORNADA (17:50 hrs)
  // ----------------------------------------------------
  const now = new Date();
  const alertTime = new Date();
  alertTime.setHours(17, 50, 0, 0);
  
  if (now < alertTime) {
    const msUntilAlert = alertTime.getTime() - now.getTime();
    setTimeout(() => {
      if (sessionStorage.getItem('access_token')) {
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
