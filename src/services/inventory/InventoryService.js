import api from '@/api/axios';

export default {
    // GET /api/inventarios
    getAll(params = {}) {
        return api.get('/inventarios', { params });
    },
    // GET /api/inventarios/{id}
    getById(id) {
        return api.get(`/inventarios/${id}`);
    },
    // POST /api/inventarios
    create(data) {
        return api.post('/inventarios', data);
    },
    // PUT /api/inventarios/{id}
    update(id, data) {
        return api.put(`/inventarios/${id}`, data);
    },
    // DELETE /api/inventarios/{id}
    delete(id) {
        return api.delete(`/inventarios/${id}`);
    },

    // GET /api/inventarios/exportar
    export() {
        return api.get('/inventarios/exportar', { responseType: 'blob' });
    }
}
