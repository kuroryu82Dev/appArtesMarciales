import usersDao from '../dao/users.dao.js';

class UsersRepository {
    async findByEmail(email) {
        return await usersDao.findByEmail(email);
    }

    async create(userData) {
        return await usersDao.create(userData);
    }
}

export default new UsersRepository();