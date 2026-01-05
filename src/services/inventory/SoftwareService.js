import api from '@/api/axios';

export default {
    // GET /api/inventario-software
    // Supports params: page, per_page, nombre, tipo
    getAll(params = {}) {
        return api.get('/inventario-software', { params });
    },
    // GET /api/inventario-software/{id}
    getById(id) {
        return api.get(`/inventario-software/${id}`);
    },
    // POST /api/inventario-software
    create(data) {
        return api.post('/inventario-software', data);
    },
    // PUT /api/inventario-software/{id}
    update(id, data) {
        return api.put(`/inventario-software/${id}`, data);
    },
    // DELETE /api/inventario-software/{id}
    delete(id) {
        return api.delete(`/inventario-software/${id}`);
    }
}
