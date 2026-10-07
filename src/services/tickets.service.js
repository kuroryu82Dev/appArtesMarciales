import { randomUUID } from 'node:crypto';

import TicketDTO from '../dto/ticket.dto.js';
import eventsRepository from '../repositories/events.repository.js';
import ticketsRepository from '../repositories/tickets.repository.js';
import emailService from './email.service.js';
import HttpError from '../utils/http-error.js';
import { isValidObjectId } from '../utils/object-id.js';

const requireValidId = (id, entity = 'Ticket') => {
    if (!isValidObjectId(id)) throw new HttpError(`${entity} no encontrado`, 404);
};

class TicketsService {
    async register(eventId, quantity, user) {
        requireValidId(eventId, 'Evento');
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new HttpError('La cantidad debe ser un número entero mayor que 0', 400);
        }

        const event = await eventsRepository.findById(eventId);
        if (!event) throw new HttpError('Evento no encontrado', 404);
        if (event.status !== 'published' || event.date <= new Date()) {
            throw new HttpError('El evento no está disponible para inscripciones', 409);
        }
        if (await ticketsRepository.findActiveRegistration(user.id, eventId)) {
            throw new HttpError('El usuario ya tiene una inscripción activa para este evento', 409);
        }

        const reservedQuantity = await ticketsRepository.getReservedQuantity(eventId);
        const available = event.capacity - reservedQuantity;
        if (available < quantity) {
            throw new HttpError(`Cupos insuficientes: quedan ${Math.max(available, 0)}`, 409);
        }

        let ticket;
        try {
            ticket = await ticketsRepository.createRegistration({
                user: user.id,
                event: eventId,
                status: 'confirmed',
                quantity,
                reservationCode: randomUUID(),
            });
        } catch (error) {
            if (error?.code === 11000) {
                throw new HttpError('El usuario ya tiene una inscripción activa para este evento', 409);
            }
            throw error;
        }
        await this.notify('sendTicketConfirmation', { to: user.email, event, ticket });
        return new TicketDTO(ticket);
    }

    async getMine(user) {
        return (await ticketsRepository.findMyTickets(user.id)).map((ticket) => new TicketDTO(ticket));
    }

    async getByEvent(eventId, user) {
        requireValidId(eventId, 'Evento');
        const event = await eventsRepository.findById(eventId);
        if (!event) throw new HttpError('Evento no encontrado', 404);
        const organizerId = event.organizer?.toString();
        if (user.role !== 'admin' && (user.role !== 'organizer' || organizerId !== user.id)) {
            throw new HttpError('No tenés permisos para consultar las inscripciones de este evento', 403);
        }
        return (await ticketsRepository.findEventTickets(eventId)).map((ticket) => new TicketDTO(ticket));
    }

    async cancel(id, user) {
        requireValidId(id);
        const ticket = await ticketsRepository.findTicketById(id);
        if (!ticket) throw new HttpError('Ticket no encontrado', 404);
        const ownerId = (ticket.user?._id ?? ticket.user)?.toString();
        if (user.role !== 'admin' && ownerId !== user.id) {
            throw new HttpError('No tenés permisos para cancelar este ticket', 403);
        }
        if (ticket.status === 'cancelled') throw new HttpError('El ticket ya está cancelado', 409);
        const cancelledTicket = await ticketsRepository.cancelTicket(id, new Date());
        await this.notify('sendTicketCancellation', {
            to: cancelledTicket.user?.email,
            event: cancelledTicket.event,
            ticket: cancelledTicket,
        });
        return new TicketDTO(cancelledTicket);
    }

    async notify(method, data) {
        try {
            await emailService[method](data);
        } catch (error) {
            // El cambio ya está guardado: SMTP no debe convertirlo en un error de API.
            console.error('No se pudo enviar la notificación del ticket', {
                notification: method,
                ticketId: data.ticket._id?.toString(),
                code: error.code ?? error.name,
            });
        }
    }
}

export default new TicketsService();
