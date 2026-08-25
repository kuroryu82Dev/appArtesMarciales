import 'dotenv/config';

const env = {
    port: Number(process.env.PORT) || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
}

export default env;