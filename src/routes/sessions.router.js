import { Router } from 'express';
import { current, getSessionStatus, login, logout, register } from '../controllers/sessions.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getSessionStatus);
router.post('/register', register);
router.post('/login', login);
router.get('/current', authMiddleware, current);
router.post('/logout', logout);

export default router;
