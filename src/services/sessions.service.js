import sessionsRepository from '../repositories/sessions.repository.js';
import env from '../config/env.config.js';
import UserDTO from '../dto/user.dto.js';
import usersRepository from '../repositories/users.repository.js';
import hashUtils from '../utils/hash.js';
import HttpError from '../utils/http-error.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

class SessionsService {
    async register(data) {
        const first_name = typeof data.first_name === 'string' ? data.first_name.trim() : '';
        const last_name = typeof data.last_name === 'string' ? data.last_name.trim() : '';
        const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
        const password = typeof data.password === 'string' ? data.password : '';
        if (!first_name || !last_name || !email || !password) throw new HttpError('Faltan campos obligatorios', 400);
        if (!EMAIL_PATTERN.test(email)) throw new HttpError('El formato del email no es válido', 400);
        if (password.length < MIN_PASSWORD_LENGTH) throw new HttpError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, 400);
        if (await usersRepository.findByEmail(email)) throw new HttpError('El email ya está registrado', 409);

        try {
            const user = await usersRepository.create({
                first_name, last_name, email, password: await hashUtils.createHash(password), role: 'user',
            });
            return new UserDTO(user);
        } catch (error) {
            if (error?.code === 11000) throw new HttpError('El email ya está registrado', 409);
            throw error;
        }
    }

    async authenticate(emailValue, password) {
        const email = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '';
        if (!email || !password) throw new HttpError('Credenciales inválidas', 401);
        const user = await usersRepository.findByEmailWithPassword(email);
        if (!user || !(await hashUtils.isValidPassword(password, user.password))) {
            throw new HttpError('Credenciales inválidas', 401);
        }
        return new UserDTO(user);
    }

    async getStatus() {
        return sessionsRepository.getStatus();
    }

    cookieOptions() {
        return {
            httpOnly: true,
            sameSite: 'lax',
            secure: env.nodeEnv === 'production',
            maxAge: 3600000,
        };
    }

    clearCookieOptions() {
        const { maxAge, ...options } = this.cookieOptions();
        return options;
    }
}

export default new SessionsService();
