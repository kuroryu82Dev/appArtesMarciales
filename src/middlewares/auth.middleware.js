import passport from 'passport';

import HttpError from '../utils/http-error.js';

const authMiddleware = (req, res, next) => {
    passport.authenticate('current', { session: false }, (error, user) => {
        if (error) return next(error);
        if (!user) return next(new HttpError('No autenticado', 401));
        req.user = user;
        return next();
    })(req, res, next);
};

export default authMiddleware;
