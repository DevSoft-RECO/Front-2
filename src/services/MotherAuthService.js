import axios from 'axios';

const motherApi = axios.create({
  baseURL: import.meta.env.VITE_MOTHER_API_URL
});

// Interceptor para inyectar token automáticamente
motherApi.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  async getMyProfile() {
    // GET /api/me
    // Según la guía, la respuesta trae: id, name, email, avatar, roles[], permissions[], etc.
    const response = await motherApi.get('/api/me');
    return response.data;
  }
};
