import { Router } from 'express';
import { getUsers } from '../controllers/users.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', authMiddleware, authorize('admin'), getUsers);

export default router;
