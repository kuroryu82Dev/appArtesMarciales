import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const createHash = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export const isValidPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}