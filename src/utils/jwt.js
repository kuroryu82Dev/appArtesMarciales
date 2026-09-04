import jwt from 'jsonwebtoken';
import env from '../config/env.config.js';

const getSecret = () => {
    if (!env.jwtSecret) {
        throw new Error('JWT_SECRET no está configurado');
    }

    return env.jwtSecret;
};

export const generateToken = (payload) =>
    jwt.sign(payload, getSecret(), { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, getSecret());
