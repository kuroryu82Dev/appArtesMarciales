import { Router } from 'express';
import {
    createEvent,
    getEvents,
    updateEvent,
} from '../controllers/events.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', getEvents);
router.post(
    '/',
    authMiddleware,
    authorize('organizer', 'admin'),
    createEvent,
);
router.patch(
    '/:id',
    authMiddleware,
    authorize('organizer', 'admin'),
    updateEvent,
);

export default router;
