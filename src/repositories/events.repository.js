import eventsDao from '../dao/events.dao.js';

class EventsRepository {
    async getAll() {
        return eventsDao.getAll();
    }
}

export default new EventsRepository();
