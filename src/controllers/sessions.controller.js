import sessionsService from '../services/sessions.service.js';

export const getSessionStatus = async (req, res, next) => {
    try {
    const session = await sessionsService.getStatus();

    res.status(200).json({
        status: 'success',
        payload: session,
    });
    } catch (error) {
    next(error);
    }
};

export const register = async (req, res, next) => {
    try {
        const user = await sessionsService.register(req.body);
        res.status(201).json({
            status: 'success',
            payload: user,
        });
    }catch (error) {
        next(error);
    }
}