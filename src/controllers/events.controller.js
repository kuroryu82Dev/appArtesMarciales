import eventsService from '../services/events.service.js';

export const getEvents = async (req, res, next) => {
    try {
    const events = await eventsService.getAll();

    res.status(200).json({
        status: 'success',
        payload: events,
    });
    } catch (error) {
    next(error);
    }
};

export const createEvent = async (req, res, next) => {
    try {
        const event = await eventsService.create(req.body, req.user);

        res.status(201).json({
            status: 'success',
            payload: event,
        });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const event = await eventsService.update(
            req.params.id,
            req.body,
            req.user,
        );

        res.status(200).json({
            status: 'success',
            payload: event,
        });
    } catch (error) {
        next(error);
    }
};
