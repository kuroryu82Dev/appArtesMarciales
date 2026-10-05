import ticketsDao from '../dao/tickets.dao.js';

class TicketsRepository {
    createRegistration(data) { return ticketsDao.create(data); }
    findActiveRegistration(userId, eventId) { return ticketsDao.findActiveByUserAndEvent(userId, eventId); }
    countActiveTickets(eventId) { return ticketsDao.countActiveByEvent(eventId); }
    findMyTickets(userId) { return ticketsDao.findByUser(userId); }
    findTicketById(id) { return ticketsDao.findById(id); }
    cancelTicket(id) { return ticketsDao.updateById(id, { status: 'cancelled' }); }
}

export default new TicketsRepository();
