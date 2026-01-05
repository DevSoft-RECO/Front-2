import api from '@/api/axios';

export default {
    getAll() {
        return api.get('/event-categories');
    },

    create(data) {
        return api.post('/event-categories', data);
    },

    update(id, data) {
        return api.put(`/event-categories/${id}`, data);
    },

    delete(id) {
        return api.delete(`/event-categories/${id}`);
    }
}
