import { randomUUID } from 'node:crypto';

import TicketDTO from '../dto/ticket.dto.js';
import eventsRepository from '../repositories/events.repository.js';
import ticketsRepository from '../repositories/tickets.repository.js';
import HttpError from '../utils/http-error.js';
import { isValidObjectId } from '../utils/object-id.js';

const requireValidId = (id, entity = 'Ticket') => {
    if (!isValidObjectId(id)) throw new HttpError(`${entity} no encontrado`, 404);
};

class TicketsService {
    async register(eventId, user) {
        requireValidId(eventId, 'Evento');
        const event = await eventsRepository.findById(eventId);
        if (!event) throw new HttpError('Evento no encontrado', 404);
        if (event.status !== 'published' || event.date <= new Date()) {
            throw new HttpError('El evento no está disponible para inscripciones', 409);
        }
        if (await ticketsRepository.findActiveRegistration(user.id, eventId)) {
            throw new HttpError('El usuario ya está inscrito en este evento', 409);
        }
        if (await ticketsRepository.countActiveTickets(eventId) >= event.capacity) {
            throw new HttpError('No hay cupos disponibles', 409);
        }

        try {
            const ticket = await ticketsRepository.createRegistration({
                code: randomUUID(), user: user.id, event: eventId, status: 'active',
            });
            return new TicketDTO(ticket);
        } catch (error) {
            if (error?.code === 11000) throw new HttpError('El usuario ya está inscrito en este evento', 409);
            throw error;
        }
    }

    async getMine(user) {
        return (await ticketsRepository.findMyTickets(user.id)).map((ticket) => new TicketDTO(ticket));
    }

    async cancel(id, user) {
        requireValidId(id);
        const ticket = await ticketsRepository.findTicketById(id);
        if (!ticket) throw new HttpError('Ticket no encontrado', 404);
        const ownerId = (ticket.user?._id ?? ticket.user)?.toString();
        if (user.role !== 'admin' && ownerId !== user.id) throw new HttpError('No tenés permisos para cancelar este ticket', 403);
        if (ticket.status === 'cancelled') throw new HttpError('El ticket ya está cancelado', 409);
        return new TicketDTO(await ticketsRepository.cancelTicket(id));
    }
}

export default new TicketsService();
