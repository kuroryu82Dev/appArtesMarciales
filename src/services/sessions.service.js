import sessionsRepository from '../repositories/sessions.repository.js';

class SessionsService {
    async getStatus() {
        return sessionsRepository.getStatus();
    }
}

export default new SessionsService();