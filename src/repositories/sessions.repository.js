import sessionsDao from '../dao/sessions.dao.js';

class SessionsRepository {
    async getStatus() {
        return sessionsDao.getStatus();
    }
}

export default new SessionsRepository();