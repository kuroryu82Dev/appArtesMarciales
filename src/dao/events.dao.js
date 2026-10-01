import Event from '../models/Events.js';

class EventsDao {
    async getAll(filter, { skip, limit, sort }) {
        const [data, total] = await Promise.all([
            Event.find(filter).sort(sort).skip(skip).limit(limit),
            Event.countDocuments(filter),
        ]);
        return { data, total };
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
