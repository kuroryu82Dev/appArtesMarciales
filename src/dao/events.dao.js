import Event from '../models/Events.js';

class EventsDao {
    async getAll() {
        return Event.find({ status: 'published' }).sort({ date: 1 });
    }

    async create(eventData) {
        return Event.create(eventData);
    }

    async findById(id) {
        return Event.findById(id);
    }

    async updateById(id, eventData) {
        return Event.findByIdAndUpdate(id, eventData, {
            new: true,
            runValidators: true,
        });
    }
}

export default new EventsDao();
