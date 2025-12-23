import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // http://localhost:8000
    withCredentials: true, // Importante para cookies de sesión Laravel/Sanctum si se usaran
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// --- INTERCEPTOR DE REQUEST (Salida) ---
// Antes de que salga la petición, le pegamos el token si existe
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPONSE (Llegada) ---
// Si la respuesta es un error 401 (No autorizado), limpiamos todo
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Evitamos un bucle infinito si el error viene del login
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
                // Opcional: Redirigir al login o recargar
                // window.location.href = '/'; 
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;