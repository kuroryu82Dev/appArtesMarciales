import passport from 'passport';
import passportJwt from 'passport-jwt';
import passportLocal from 'passport-local';

import env from './env.config.js';
import sessionsService from '../services/sessions.service.js';

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const cookieExtractor = (req) => req?.cookies?.currentUser || null;

const initializePassport = () => {
    passport.use('register', new LocalStrategy({
        usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false,
    }, async (req, _email, _password, done) => {
        try {
            return done(null, await sessionsService.register(req.body));
        } catch (error) { return done(error); }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email', passwordField: 'password', session: false,
    }, async (email, password, done) => {
        try {
            return done(null, await sessionsService.authenticate(email, password));
        } catch (error) { return done(error); }
    }));

    passport.use('current', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), secretOrKey: env.jwtSecret,
    }, async (payload, done) => {
        if (!payload?.id || !payload?.email || !payload?.role) return done(null, false);
        return done(null, { id: payload.id, email: payload.email, role: payload.role });
    }));
};

export default initializePassport;
