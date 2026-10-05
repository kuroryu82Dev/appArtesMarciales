import UserDTO from '../dto/user.dto.js';
import usersRepository from '../repositories/users.repository.js';

class UsersService {
    async getAll() {
        return (await usersRepository.getAll()).map((user) => new UserDTO(user, { preserveMongoId: true }));
    }
}

export default new UsersService();
