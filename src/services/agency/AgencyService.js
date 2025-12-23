import api from '@/api/axios'; // Cliente Local

export default {
    // 1. Obtener agencias desde nuestra BD Local (Espejo)
    // GET http://localhost:8001/api/agencias
    getAll() {
        return api.get('/agencias');
    },

    // 2. Disparar autolocalización (endpoint Hija -> llama a Madre)
    // POST http://localhost:8001/api/sincronizar-agencias
    syncWithMother() {
        return api.post('/sincronizar-agencias');
    }
}
