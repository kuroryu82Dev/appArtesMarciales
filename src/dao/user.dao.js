import User from '../models/User.js';

class UserDao {
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findByEmailWithPassword(email) {
        return await User.findOne({ email }).select('+password');
    }

    async create(userData) {
        return  await User.create(userData);
    }
}

export default new UserDao();
