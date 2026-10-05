import Ticket from '../models/Ticket.js';

class TicketsDao {
    async create(data) {
        return Ticket.create(data);
    }

    async findActiveByUserAndEvent(userId, eventId) {
        return Ticket.findOne({ user: userId, event: eventId, status: 'active' });
    }

    async countActiveByEvent(eventId) {
        return Ticket.countDocuments({ event: eventId, status: 'active' });
    }

    async findByUser(userId) {
        return Ticket.find({ user: userId })
            .populate({ path: 'user', select: 'first_name last_name email role' })
            .populate({ path: 'event', populate: { path: 'organizer', select: 'first_name last_name email role' } })
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return Ticket.findById(id)
            .populate({ path: 'user', select: 'first_name last_name email role' })
            .populate({ path: 'event', populate: { path: 'organizer', select: 'first_name last_name email role' } });
    }

    async updateById(id, changes) {
        return Ticket.findByIdAndUpdate(id, changes, { new: true, runValidators: true })
            .populate({ path: 'user', select: 'first_name last_name email role' })
            .populate({ path: 'event', populate: { path: 'organizer', select: 'first_name last_name email role' } });
    }
}

export default new TicketsDao();
