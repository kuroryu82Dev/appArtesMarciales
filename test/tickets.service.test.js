import assert from 'node:assert/strict';
import test from 'node:test';

import eventsRepository from '../src/repositories/events.repository.js';
import ticketsRepository from '../src/repositories/tickets.repository.js';
import emailService from '../src/services/email.service.js';
import ticketsService from '../src/services/tickets.service.js';

const eventId = '507f1f77bcf86cd799439011';
const ticketId = '507f191e810c19729de860ea';
const publishedEvent = (overrides = {}) => ({
    title: 'Open marcial', location: 'Dojo central', status: 'published',
    date: new Date(Date.now() + 60_000), capacity: 10,
    organizer: { toString: () => 'organizer-id' }, ...overrides,
});

const snapshot = () => ({
    findEvent: eventsRepository.findById,
    findActive: ticketsRepository.findActiveRegistration,
    reserved: ticketsRepository.getReservedQuantity,
    create: ticketsRepository.createRegistration,
    findTicket: ticketsRepository.findTicketById,
    cancel: ticketsRepository.cancelTicket,
    findEventTickets: ticketsRepository.findEventTickets,
    send: emailService.sendTicketConfirmation,
});

const restore = (original) => {
    eventsRepository.findById = original.findEvent;
    ticketsRepository.findActiveRegistration = original.findActive;
    ticketsRepository.getReservedQuantity = original.reserved;
    ticketsRepository.createRegistration = original.create;
    ticketsRepository.findTicketById = original.findTicket;
    ticketsRepository.cancelTicket = original.cancel;
    ticketsRepository.findEventTickets = original.findEventTickets;
    emailService.sendTicketConfirmation = original.send;
};

test('confirma inscripción y envía email', async () => {
    const original = snapshot();
    let sent;
    eventsRepository.findById = async () => publishedEvent();
    ticketsRepository.findActiveRegistration = async () => null;
    ticketsRepository.getReservedQuantity = async () => 3;
    ticketsRepository.createRegistration = async (data) => ({ _id: ticketId, ...data });
    emailService.sendTicketConfirmation = async (data) => { sent = data; };
    try {
        const result = await ticketsService.register(eventId, 2, { id: 'user-id', email: 'user@mail.com' });
        assert.equal(result.status, 'confirmed');
        assert.equal(result.quantity, 2);
        assert.ok(result.reservationCode);
        assert.equal(sent.to, 'user@mail.com');
    } finally { restore(original); }
});

test('rechaza quantity inválida', async () => {
    await assert.rejects(ticketsService.register(eventId, 0, { id: 'user' }), (error) => error.statusCode === 400);
    await assert.rejects(ticketsService.register(eventId, 1.5, { id: 'user' }), (error) => error.statusCode === 400);
});

test('evento inexistente produce 404', async () => {
    const original = snapshot();
    eventsRepository.findById = async () => null;
    try {
        await assert.rejects(ticketsService.register(eventId, 1, { id: 'user' }), (error) => error.statusCode === 404);
    } finally { restore(original); }
});

test('rechaza evento cancelado, finalizado o no publicado', async () => {
    const original = snapshot();
    try {
        for (const status of ['cancelled', 'finished', 'draft']) {
            eventsRepository.findById = async () => publishedEvent({ status });
            await assert.rejects(ticketsService.register(eventId, 1, { id: 'user' }), (error) => error.statusCode === 409);
        }
    } finally { restore(original); }
});

test('rechaza inscripción activa duplicada', async () => {
    const original = snapshot();
    eventsRepository.findById = async () => publishedEvent();
    ticketsRepository.findActiveRegistration = async () => ({ _id: 'existing' });
    try {
        await assert.rejects(ticketsService.register(eventId, 1, { id: 'user' }), (error) => error.statusCode === 409);
    } finally { restore(original); }
});

test('rechaza cuando la suma de quantity deja cupos insuficientes', async () => {
    const original = snapshot();
    eventsRepository.findById = async () => publishedEvent({ capacity: 5 });
    ticketsRepository.findActiveRegistration = async () => null;
    ticketsRepository.getReservedQuantity = async () => 4;
    try {
        await assert.rejects(ticketsService.register(eventId, 2, { id: 'user' }), /quedan 1/);
    } finally { restore(original); }
});

test('cancelación propia registra cancelledAt y libera el cupo', async () => {
    const original = snapshot();
    let active = true;
    let cancelledAt;
    ticketsRepository.findTicketById = async () => ({ user: 'owner', status: 'confirmed', quantity: 2 });
    ticketsRepository.cancelTicket = async (_id, date) => {
        active = false;
        cancelledAt = date;
        return { _id: ticketId, user: 'owner', status: 'cancelled', quantity: 2, cancelledAt: date };
    };
    eventsRepository.findById = async () => publishedEvent({ capacity: 2 });
    ticketsRepository.findActiveRegistration = async () => null;
    ticketsRepository.getReservedQuantity = async () => active ? 2 : 0;
    ticketsRepository.createRegistration = async (data) => ({ _id: 'new-ticket', ...data });
    emailService.sendTicketConfirmation = async () => {};
    try {
        const cancelled = await ticketsService.cancel(ticketId, { id: 'owner', role: 'user' });
        assert.equal(cancelled.status, 'cancelled');
        assert.ok(cancelledAt instanceof Date);
        const replacement = await ticketsService.register(eventId, 2, { id: 'new-user', email: 'new@mail.com' });
        assert.equal(replacement.quantity, 2);
    } finally { restore(original); }
});

test('user no cancela ticket ajeno', async () => {
    const original = snapshot();
    ticketsRepository.findTicketById = async () => ({ user: 'owner', status: 'confirmed' });
    try {
        await assert.rejects(ticketsService.cancel(ticketId, { id: 'other', role: 'user' }), (error) => error.statusCode === 403);
    } finally { restore(original); }
});

test('sólo organizer propietario o admin lista tickets del evento', async () => {
    const original = snapshot();
    eventsRepository.findById = async () => publishedEvent();
    ticketsRepository.findEventTickets = async () => [];
    try {
        await assert.rejects(ticketsService.getByEvent(eventId, { id: 'user', role: 'user' }), (error) => error.statusCode === 403);
        await assert.rejects(ticketsService.getByEvent(eventId, { id: 'other', role: 'organizer' }), (error) => error.statusCode === 403);
        assert.deepEqual(await ticketsService.getByEvent(eventId, { id: 'organizer-id', role: 'organizer' }), []);
        assert.deepEqual(await ticketsService.getByEvent(eventId, { id: 'admin', role: 'admin' }), []);
    } finally { restore(original); }
});
