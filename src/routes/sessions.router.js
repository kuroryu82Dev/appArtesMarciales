import { Router } from 'express';
import { getSessionStatus } from '../controllers/sessions.controller.js';

const router = Router();

router.get('/', getSessionStatus);
router.post('/register', register);

export default router;