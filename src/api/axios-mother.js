import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// Cliente para la App Madre (Auth y Datos Globales)
const motherApi = axios.create({
    baseURL: import.meta.env.VITE_MOTHER_API_URL, // Generalmente el backend madre (ej puerto 8000)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para inyectar el token si es necesario
motherApi.interceptors.request.use(config => {
    const authStore = useAuthStore();
    // A veces la madre necesita el token incluso para endpoints públicos si hay sesión
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
});

export default motherApi;
