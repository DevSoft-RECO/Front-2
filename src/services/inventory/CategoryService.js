import api from '@/api/axios';

export default {
    // GET /api/categorias
    getAll() {
        return api.get('/categorias');
    },
    // POST /api/categorias
    create(data) {
        return api.post('/categorias', data);
    },
    // PUT /api/categorias/{id}
    update(id, data) {
        return api.put(`/categorias/${id}`, data);
    },
    // DELETE /api/categorias/{id}
    delete(id) {
        return api.delete(`/categorias/${id}`);
    }
}
