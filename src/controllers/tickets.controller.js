import ticketsService from '../services/tickets.service.js';

export const createTicket = async (req, res, next) => {
    try {
        const ticket = await ticketsService.register(req.body.eventId, req.user);
        res.status(201).json({ status: 'success', data: ticket });
    } catch (error) { next(error); }
};

export const getMyTickets = async (req, res, next) => {
    try {
        res.status(200).json({ status: 'success', data: await ticketsService.getMine(req.user) });
    } catch (error) { next(error); }
};

export const cancelTicket = async (req, res, next) => {
    try {
        res.status(200).json({ status: 'success', data: await ticketsService.cancel(req.params.id, req.user) });
    } catch (error) { next(error); }
};
