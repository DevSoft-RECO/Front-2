import api from '@/api/axios';

export default {
    // GET /api/inventarios/{id}/incidentes
    // Obtiene el historial de un equipo en particular
    getByInventory(inventoryId) {
        return api.get(`/inventarios/${inventoryId}/incidentes`);
    },

    // POST /api/incidentes
    // Registra un nuevo incidente
    create(data) {
        return api.post('/incidentes', data);
    }
}
