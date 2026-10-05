import ticketsDao from '../dao/tickets.dao.js';

class TicketsRepository {
    createRegistration(data) { return ticketsDao.create(data); }
    findActiveRegistration(userId, eventId) { return ticketsDao.findActiveByUserAndEvent(userId, eventId); }
    getReservedQuantity(eventId) { return ticketsDao.sumActiveQuantityByEvent(eventId); }
    findMyTickets(userId) { return ticketsDao.findByUser(userId); }
    findEventTickets(eventId) { return ticketsDao.findByEvent(eventId); }
    findTicketById(id) { return ticketsDao.findById(id); }
    cancelTicket(id, cancelledAt) {
        return ticketsDao.updateById(id, { status: 'cancelled', cancelledAt });
    }
}

export default new TicketsRepository();
