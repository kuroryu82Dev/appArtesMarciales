import sessionsService from '../services/sessions.service.js';
import jwtUtils from '../utils/jwt.js';

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

export const register = (req, res) => {
    res.status(201).json({
        status: 'success',
        payload: req.user,
    });
};

export const login = (req, res) => {
    const token = jwtUtils.generateToken({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
    });

    res.cookie(
        'currentUser',
        token,
        sessionsService.cookieOptions(),
    );

    res.status(200).json({
        status: 'success',
        message: 'Login correcto',
    });
};

export const current = (req, res) => {
    res.status(200).json({
        status: 'success',
        payload: req.user,
    });
};

export const logout = (req, res) => {
    res.clearCookie(
        'currentUser',
        sessionsService.clearCookieOptions(),
    );

    res.status(200).json({
        status: 'success',
        message: 'Sesión cerrada',
    });
};

export default {
    getSessionStatus,
    register,
    login,
    current,
    logout,
};
