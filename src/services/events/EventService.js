import api from '@/api/axios';

export default {
    /**
     * Get all events
     * @param {Object} params { start_date, end_date, event_category_id }
     */
    getAll(params = {}) {
        return api.get('/events', { params });
    },

    getById(id) {
        return api.get(`/events/${id}`);
    },

    create(data) {
        return api.post('/events', data);
    },

    update(id, data) {
        return api.put(`/events/${id}`, data);
    },

    delete(id) {
        return api.delete(`/events/${id}`);
    }
}
