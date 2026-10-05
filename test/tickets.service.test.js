import assert from 'node:assert/strict';
import test from 'node:test';

import eventsRepository from '../src/repositories/events.repository.js';
import ticketsRepository from '../src/repositories/tickets.repository.js';
import ticketsService from '../src/services/tickets.service.js';

const eventId = '507f1f77bcf86cd799439011';
const ticketId = '507f191e810c19729de860ea';

test('rechaza inscripción duplicada con 409', async () => {
    const findEvent = eventsRepository.findById;
    const findActive = ticketsRepository.findActiveRegistration;
    eventsRepository.findById = async () => ({ status: 'published', date: new Date(Date.now() + 60_000), capacity: 2 });
    ticketsRepository.findActiveRegistration = async () => ({ id: 'existing' });
    try {
        await assert.rejects(ticketsService.register(eventId, { id: 'user' }), (error) => error.statusCode === 409);
    } finally {
        eventsRepository.findById = findEvent;
        ticketsRepository.findActiveRegistration = findActive;
    }
});

test('rechaza inscripción sin cupo con 409', async () => {
    const findEvent = eventsRepository.findById;
    const findActive = ticketsRepository.findActiveRegistration;
    const count = ticketsRepository.countActiveTickets;
    eventsRepository.findById = async () => ({ status: 'published', date: new Date(Date.now() + 60_000), capacity: 1 });
    ticketsRepository.findActiveRegistration = async () => null;
    ticketsRepository.countActiveTickets = async () => 1;
    try {
        await assert.rejects(ticketsService.register(eventId, { id: 'user' }), (error) => error.statusCode === 409);
    } finally {
        eventsRepository.findById = findEvent;
        ticketsRepository.findActiveRegistration = findActive;
        ticketsRepository.countActiveTickets = count;
    }
});

test('sólo el dueño o admin puede cancelar un ticket', async () => {
    const find = ticketsRepository.findTicketById;
    const cancel = ticketsRepository.cancelTicket;
    ticketsRepository.findTicketById = async () => ({ user: 'owner', status: 'active' });
    ticketsRepository.cancelTicket = async () => ({ _id: ticketId, user: 'owner', status: 'cancelled' });
    try {
        await assert.rejects(ticketsService.cancel(ticketId, { id: 'other', role: 'user' }), (error) => error.statusCode === 403);
        assert.equal((await ticketsService.cancel(ticketId, { id: 'other', role: 'admin' })).status, 'cancelled');
    } finally {
        ticketsRepository.findTicketById = find;
        ticketsRepository.cancelTicket = cancel;
    }
});
