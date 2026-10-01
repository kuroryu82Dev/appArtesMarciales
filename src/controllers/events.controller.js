import eventsService from '../services/events.service.js';

export const getEvents = async (req, res, next) => {
    try {
        res.status(200).json(await eventsService.getAll(req.query));
    } catch (error) { next(error); }
};

export const getEventById = async (req, res, next) => {
    try {
        const event = await eventsService.getById(req.params.id);
        res.status(200).json({ status: 'success', data: event });
    } catch (error) { next(error); }
};

export const createEvent = async (req, res, next) => {
    try {
        const event = await eventsService.create(req.body, req.user);
        res.status(201).json({ status: 'success', data: event });
    } catch (error) { next(error); }
};

export const updateEvent = async (req, res, next) => {
    try {
        const event = await eventsService.update(req.params.id, req.body, req.user);
        res.status(200).json({ status: 'success', data: event });
    } catch (error) { next(error); }
};

export const changeEventStatus = async (req, res, next) => {
    try {
        const event = await eventsService.changeStatus(req.params.id, req.body.status, req.user);
        res.status(200).json({ status: 'success', data: event });
    } catch (error) { next(error); }
};
