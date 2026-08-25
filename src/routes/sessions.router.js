import { Router } from 'express';
import { getSessionStatus } from '../controllers/sessions.controller.js';

const router = Router();

router.get('/', getSessionStatus);

export default router;