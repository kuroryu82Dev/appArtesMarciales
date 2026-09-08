import sessionsRepository from '../repositories/sessions.repository.js';
import env from '../config/env.config.js';

class SessionsService {
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