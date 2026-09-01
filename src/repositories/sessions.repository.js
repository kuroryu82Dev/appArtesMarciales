import usersRepository from '../repositories/users.repository.js';
import { createHash } from '../utils/hash.js';
import HttpError from '../utils/http-error.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

class SessionsService {
    async register(data) {
        const firstName =
        typeof data.first_name === 'string' ? data.first_name.trim() : '';

        const lastName =
        typeof data.last_name === 'string' ? data.last_name.trim() : '';

        const email =
        typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';

        const password = typeof data.password === 'string' ? data.password : '';

        if (!firstName || !lastName || !email || !password) {
        throw new HttpError('Faltan campos obligatorios', 400);
        }

        if (!EMAIL_PATTERN.test(email)) {
        throw new HttpError('El formato del email no es válido', 400);
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
        throw new HttpError(
            `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
            400,
        );
        }

        const existingUser = await usersRepository.findByEmail(email);

        if (existingUser) {
            throw new HttpError('El email ya está registrado', 409);
        }

        const hashedPassword = await createHash(password);

        try {
            const user = await usersRepository.create({
                first_name: firstName,
                last_name: lastName,
                email,
                password: hashedPassword,
            });

            return {
                id: user._id.toString(),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
            };
        } catch (error) {
            if (error?.code === 11000) {
                throw new HttpError('El email ya está registrado', 409);
            }

            throw error;
        }
    }
}

export default new SessionsService();