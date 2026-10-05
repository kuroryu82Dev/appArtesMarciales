import { Router } from 'express';

import { changeEventStatus, createEvent, getEventById, getEvents, updateEvent } from '../controllers/events.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import { createTicket, getEventTickets } from '../controllers/tickets.controller.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:eid/tickets', authMiddleware, createTicket);
router.get('/:eid/tickets', authMiddleware, authorize('organizer', 'admin'), getEventTickets);
router.post('/', authMiddleware, authorize('organizer', 'admin'), createEvent);
router.put('/:id', authMiddleware, authorize('organizer', 'admin'), updateEvent);
router.patch('/:id/status', authMiddleware, authorize('organizer', 'admin'), changeEventStatus);
router.patch('/:id', authMiddleware, authorize('organizer', 'admin'), updateEvent);

export default router;
