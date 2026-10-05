import { Router } from 'express';

import { cancelTicket, createTicket, getMyTickets } from '../controllers/tickets.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, createTicket);
router.get('/my', authMiddleware, getMyTickets);
router.patch('/:id/cancel', authMiddleware, cancelTicket);

export default router;
