import {} from '../models/User.js';

class UserDao {
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async create(userData) {
        return  await User.create(userData);
    }
}

export default new UserDao();