import eventsRepository from '../repositories/events.repository.js';
import HttpError from '../utils/http-error.js';
import mongoose from 'mongoose';

const EDITABLE_FIELDS = [
    'title',
    'description',
    'category',
    'date',
    'location',
    'capacity',
    'status',
];

class EventsService {
    async getAll() {
        return eventsRepository.getAll();
    }

    async create(eventData, user) {
        return eventsRepository.create({
            ...eventData,
            organizer: user.id,
        });
    }

    async update(id, changes, user) {
        if (!mongoose.isValidObjectId(id)) {
            throw new HttpError('Evento no encontrado', 404);
        }

        const event = await eventsRepository.findById(id);

        if (!event) {
            throw new HttpError('Evento no encontrado', 404);
        }

        const ownsEvent = event.organizer.toString() === user.id;
        if (user.role !== 'admin' && !ownsEvent) {
            throw new HttpError(
                'No tenés permisos para modificar este evento',
                403,
            );
        }

        const safeChanges = Object.fromEntries(
            Object.entries(changes).filter(([key]) =>
                EDITABLE_FIELDS.includes(key),
            ),
        );

        return eventsRepository.updateById(id, safeChanges);
    }
}

export default new EventsService();
