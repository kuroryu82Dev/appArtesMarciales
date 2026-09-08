import express from 'express';
import passport from 'passport';
import sessionsController from '../controllers/sessions.controller.js';

import HttpError from '../utils/http-error.js';

const router = express.Router();

const authenticate = (strategy, defaultMessage, failureStatus = 401) => {
    return (req, res, next) => {
        passport.authenticate(
            strategy,
            { session: false },
            (error, user) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    return next(
                        new HttpError(
                            defaultMessage,
                            failureStatus,
                        ),
                    );
                }

                req.user = user;
                return next();
            },
        )(req, res, next);
    };
};

router.get('/', sessionsController.getSessionStatus);

router.post(
    '/register',
    authenticate('register', 'Faltan campos obligatorios', 400),
    sessionsController.register,
);

router.post(
    '/login',
    authenticate('login', 'Credenciales inválidas'),
    sessionsController.login,
);

router.get(
    '/current',
    authenticate('current', 'No autenticado'),
    sessionsController.current,
);

router.post('/logout', sessionsController.logout);

export default router;
