import usersDao from '../dao/user.dao.js';

class UsersRepository {
    async findByEmail(email) {
        return await usersDao.findByEmail(email);
    }

    async findByEmailWithPassword(email) {
        return await usersDao.findByEmailWithPassword(email);
    }

    async create(userData) {
        return await usersDao.create(userData);
    }
}

export default new UsersRepository();
