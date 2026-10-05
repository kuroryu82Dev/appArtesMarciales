import User from '../models/User.js';

class UserDao {
    async findById(id) {
        return User.findById(id);
    }

    async findOne(filter) {
        return User.findOne(filter);
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findByEmailWithPassword(email) {
        return await User.findOne({ email }).select('+password');
    }

    async create(userData) {
        return  await User.create(userData);
    }

    async getAll() {
        return User.find().sort({ createdAt: -1 });
    }

    async updateById(id, changes) {
        return User.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
    }
}

export default new UserDao();
