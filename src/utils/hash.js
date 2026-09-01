import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const createHash = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const isValidPassword = (password, hashedPassword) =>
    bcrypt.compare(password, hashedPassword);
