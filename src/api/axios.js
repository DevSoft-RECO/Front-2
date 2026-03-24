import axios from 'axios';

// Cliente para la App Hija (Local / Espejo)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // Aseguramos que apunte a /api
  // withCredentials: true, // COMENTADO: Esto puede causar 401 si el backend no espera cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// --- INTERCEPTOR DE REQUEST (Salida) ---
// Antes de que salga la petición, le pegamos el token si existe
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');

    if (token) {
      // Aseguramos que no haya doble Bearer por si acaso
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authHeader;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPONSE (Llegada) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      sessionStorage.clear();

      // Redirigir al login usando AuthService
      import('@/services/AuthService').then(module => {
        module.default.login();
      });
    }
    return Promise.reject(error);
  }
);


export default api;
