import eventsDao from '../dao/events.dao.js';

class EventsRepository {
    async getAll(filter, options) {
        return eventsDao.getAll(filter, options);
    }

    async create(eventData) {
        return eventsDao.create(eventData);
    }

    async findById(id) {
        return eventsDao.findById(id);
    }

    async updateById(id, eventData) {
        return eventsDao.updateById(id, eventData);
    }
}

export default new EventsRepository();
