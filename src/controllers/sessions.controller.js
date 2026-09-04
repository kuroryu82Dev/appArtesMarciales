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
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const token = await sessionsService.login(req.body);

        res.cookie('currentUser', token, sessionsService.cookieOptions());
        res.status(200).json({
            status: 'success',
            message: 'Login correcto',
        });
    } catch (error) {
        next(error);
    }
};

export const current = (req, res) => {
    res.status(200).json({
        status: 'success',
        payload: req.user,
    });
};

export const logout = (req, res) => {
    res.clearCookie('currentUser', sessionsService.clearCookieOptions());
    res.status(200).json({
        status: 'success',
        message: 'Sesión cerrada',
    });
};
