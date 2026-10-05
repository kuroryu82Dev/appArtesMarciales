import usersDao from '../dao/user.dao.js';

class UsersRepository {
    async findById(id) {
        return usersDao.findById(id);
    }

    async findByEmail(email) {
        return await usersDao.findByEmail(email);
    }

    async findByEmailWithPassword(email) {
        return await usersDao.findByEmailWithPassword(email);
    }

    async create(userData) {
        return await usersDao.create(userData);
    }

    async getAll() {
        return usersDao.getAll();
    }
}

export default new UsersRepository();
