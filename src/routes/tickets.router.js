import { Router } from 'express';

import { cancelTicket, createTicket, getMyTickets } from '../controllers/tickets.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/my-tickets', authMiddleware, getMyTickets);
router.patch('/:tid/cancel', authMiddleware, cancelTicket);

// Alias conservados para no romper clientes de versiones anteriores.
router.post('/', authMiddleware, createTicket);
router.get('/my', authMiddleware, getMyTickets);

export default router;
