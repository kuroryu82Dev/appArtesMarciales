import mongoose from 'mongoose';

import Ticket from '../models/Ticket.js';

const ACTIVE_STATUSES = ['confirmed', 'pending'];

class TicketsDao {
    create(data) {
        return Ticket.create(data);
    }

    findActiveByUserAndEvent(userId, eventId) {
        return Ticket.findOne({ user: userId, event: eventId, status: { $in: ACTIVE_STATUSES } });
    }

    async sumActiveQuantityByEvent(eventId) {
        const eventObjectId = new mongoose.Types.ObjectId(eventId);
        const [result] = await Ticket.aggregate([
            { $match: { event: eventObjectId, status: { $in: ACTIVE_STATUSES } } },
            { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);
        return result?.total ?? 0;
    }

    findByUser(userId) {
        return Ticket.find({ user: userId })
            .populate({ path: 'event', select: 'title date location' })
            .sort({ createdAt: -1 });
    }

    findByEvent(eventId) {
        return Ticket.find({ event: eventId })
            .populate({ path: 'user', select: 'first_name last_name email role' })
            .populate({ path: 'event', select: 'title date location organizer' })
            .sort({ createdAt: -1 });
    }

    findById(id) {
        return Ticket.findById(id)
            .populate({ path: 'user', select: 'first_name last_name email role' })
            .populate({ path: 'event', select: 'title date location organizer' });
    }

    updateById(id, changes) {
        return Ticket.findByIdAndUpdate(id, changes, { new: true, runValidators: true })
            .populate({ path: 'user', select: 'first_name last_name email role' })
            .populate({ path: 'event', select: 'title date location organizer' });
    }
}

export default new TicketsDao();
