import passport from 'passport';
import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';

import env from './env.config.js';
import usersRepository from '../repositories/users.repository.js';
import hashUtils from '../utils/hash.js';
import HttpError from '../utils/http-error.js';

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const createHash = hashUtils.createHash;
const isValidPassword = hashUtils.isValidPassword;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const cookieExtractor = (req) => {
    return req?.cookies?.currentUser || null;
};

const initializePassport = () => {
    passport.use(
        'register',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
                session: false,
            },
            async (req, emailValue, passwordValue, done) => {
                try {
                    const firstName =
                        typeof req.body.first_name === 'string'
                            ? req.body.first_name.trim()
                            : '';

                    const lastName =
                        typeof req.body.last_name === 'string'
                            ? req.body.last_name.trim()
                            : '';

                    const email =
                        typeof emailValue === 'string'
                            ? emailValue.trim().toLowerCase()
                            : '';

                    const password =
                        typeof passwordValue === 'string'
                            ? passwordValue
                            : '';

                    if (!firstName || !lastName || !email || !password) {
                        return done(
                            new HttpError('Faltan campos obligatorios', 400),
                        );
                    }

                    if (!EMAIL_PATTERN.test(email)) {
                        return done(
                            new HttpError(
                                'El formato del email no es válido',
                                400,
                            ),
                        );
                    }

                    if (password.length < MIN_PASSWORD_LENGTH) {
                        return done(
                            new HttpError(
                                `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
                                400,
                            ),
                        );
                    }

                    const existingUser =
                        await usersRepository.findByEmail(email);

                    if (existingUser) {
                        return done(
                            new HttpError('El email ya está registrado', 409),
                        );
                    }

                    const hashedPassword = await createHash(password);

                    let user;

                    try {
                        user = await usersRepository.create({
                            first_name: firstName,
                            last_name: lastName,
                            email,
                            password: hashedPassword,
                            role: 'user',
                        });
                    } catch (error) {
                        if (error?.code === 11000) {
                            return done(
                                new HttpError(
                                    'El email ya está registrado',
                                    409,
                                ),
                            );
                        }

                        throw error;
                    }

                    return done(null, {
                        id: user._id.toString(),
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        role: user.role,
                    });
                } catch (error) {
                    return done(error);
                }
            },
        ),
    );

    passport.use(
        'login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                session: false,
            },
            async (emailValue, password, done) => {
                try {
                    const email =
                        typeof emailValue === 'string'
                            ? emailValue.trim().toLowerCase()
                            : '';

                    if (!email || !password) {
                        return done(null, false, {
                            message: 'Credenciales inválidas',
                        });
                    }

                    const user =
                        await usersRepository.findByEmailWithPassword(email);

                    const validPassword = user
                        ? await isValidPassword(password, user.password)
                        : false;

                    if (!user || !validPassword) {
                        return done(null, false, {
                            message: 'Credenciales inválidas',
                        });
                    }

                    return done(null, {
                        id: user._id.toString(),
                        email: user.email,
                        role: user.role,
                    });
                } catch (error) {
                    return done(error);
                }
            },
        ),
    );

    passport.use(
        'current',
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: env.jwtSecret,
            },
            async (payload, done) => {
                try {
                    if (!payload?.id || !payload?.email || !payload?.role) {
                        return done(null, false, {
                            message: 'No autenticado',
                        });
                    }

                    return done(null, {
                        id: payload.id,
                        email: payload.email,
                        role: payload.role,
                    });
                } catch (error) {
                    return done(error);
                }
            },
        ),
    );
};

export default initializePassport;
