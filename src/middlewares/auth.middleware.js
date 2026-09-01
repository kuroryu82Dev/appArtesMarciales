import { verifyToken } from '../utils/jwt.js';

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.currentUser;

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado',
        });
    }

    try {
        const payload = verifyToken(token);

        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
        };

        return next();
    } catch {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado',
        });
    }
};

export default authMiddleware;
