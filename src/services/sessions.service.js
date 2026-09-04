import sessionsRepository from '../repositories/sessions.repository.js';
import usersRepository from '../repositories/users.repository.js';
import env from '../config/env.config.js';
import { isValidPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import HttpError from '../utils/http-error.js';

class SessionsService {
    async getStatus() {
        return sessionsRepository.getStatus();
    }

    async register(data = {}) {
        return sessionsRepository.register(data);
    }

    async login(data = {}) {
        const email =
            typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
        const password = typeof data.password === 'string' ? data.password : '';

        if (!email || !password) {
            throw new HttpError('Credenciales inválidas', 401);
        }

        const user = await usersRepository.findByEmailWithPassword(email);
        const validPassword = user
            ? await isValidPassword(password, user.password)
            : false;

        if (!user || !validPassword) {
            throw new HttpError('Credenciales inválidas', 401);
        }

        return generateToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        });
    }

    cookieOptions() {
        return {
            httpOnly: true,
            sameSite: 'lax',
            secure: env.nodeEnv === 'production',
            maxAge: 3600000,
        };
    }
}

export default new SessionsService();
