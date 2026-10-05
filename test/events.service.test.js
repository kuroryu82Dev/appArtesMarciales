import assert from 'node:assert/strict';
import test from 'node:test';

import eventsRepository from '../src/repositories/events.repository.js';
import eventsService from '../src/services/events.service.js';

const validEvent = (overrides = {}) => ({
    title: 'Seminario de karate', description: 'Técnicas avanzadas', category: 'workshop',
    date: new Date(Date.now() + 86_400_000).toISOString(), location: 'Dojo central',
    capacity: 30, price: 250, ...overrides,
});

test('asigna organizer desde el usuario y no desde el body', async () => {
    const original = eventsRepository.create;
    let saved;
    eventsRepository.create = async (data) => { saved = data; return data; };
    try {
        await eventsService.create(validEvent({ organizer: 'ajeno' }), { id: 'owner' });
        assert.equal(saved.organizer, 'owner');
        assert.equal(saved.status, 'draft');
    } finally { eventsRepository.create = original; }
});

test('rechaza fecha pasada, capacidad cero y precio negativo', async () => {
    await assert.rejects(eventsService.create(validEvent({ date: '2020-01-01' }), { id: 'x' }), /pasado/);
    await assert.rejects(eventsService.create(validEvent({ capacity: 0 }), { id: 'x' }), /capacidad/);
    await assert.rejects(eventsService.create(validEvent({ price: -1 }), { id: 'x' }), /precio/);
});

test('construye filtros, paginación y ordenamiento', async () => {
    const original = eventsRepository.getAll;
    let received;
    eventsRepository.getAll = async (filter, options) => {
        received = { filter, options };
        return { data: [{ title: 'Evento' }], total: 12 };
    };
    try {
        const result = await eventsService.getAll({ status: 'published', category: 'workshop', page: '2', limit: '5', sort: '-date' });
        assert.deepEqual(received.filter, { status: 'published', category: 'workshop' });
        assert.deepEqual(received.options, { skip: 5, limit: 5, sort: { date: -1 } });
        assert.equal(result.data[0].title, 'Evento');
        assert.deepEqual({ ...result, data: undefined }, { data: undefined, page: 2, limit: 5, total: 12, totalPages: 3 });
    } finally { eventsRepository.getAll = original; }
});

test('dueño y admin modifican; organizer ajeno recibe 403', async () => {
    const originalFind = eventsRepository.findById;
    const originalUpdate = eventsRepository.updateById;
    eventsRepository.findById = async () => ({ organizer: { toString: () => 'owner' }, status: 'draft' });
    eventsRepository.updateById = async (_id, changes) => changes;
    try {
        assert.equal((await eventsService.update('507f1f77bcf86cd799439011', { title: 'Propio' }, { id: 'owner', role: 'organizer' })).title, 'Propio');
        await assert.rejects(eventsService.update('507f1f77bcf86cd799439011', { title: 'Ajeno' }, { id: 'other', role: 'organizer' }), (error) => error.statusCode === 403);
        assert.equal((await eventsService.update('507f1f77bcf86cd799439011', { title: 'Admin' }, { id: 'other', role: 'admin' })).title, 'Admin');
    } finally {
        eventsRepository.findById = originalFind;
        eventsRepository.updateById = originalUpdate;
    }
});

test('un evento cancelado no puede cambiar de estado', async () => {
    const original = eventsRepository.findById;
    eventsRepository.findById = async () => ({ organizer: { toString: () => 'owner' }, status: 'cancelled', date: new Date(Date.now() + 1000) });
    try {
        await assert.rejects(eventsService.changeStatus('507f1f77bcf86cd799439011', 'published', { id: 'owner', role: 'organizer' }), (error) => error.statusCode === 409);
    } finally { eventsRepository.findById = original; }
});

test('rechaza actualizar la fecha de un evento hacia el pasado', async () => {
    const original = eventsRepository.findById;
    eventsRepository.findById = async () => ({ organizer: { toString: () => 'owner' }, status: 'draft' });
    try {
        await assert.rejects(
            eventsService.update('507f1f77bcf86cd799439011', { date: '2020-01-01' }, { id: 'owner', role: 'organizer' }),
            (error) => error.statusCode === 400,
        );
    } finally { eventsRepository.findById = original; }
});

test('evento inexistente produce 404', async () => {
    const original = eventsRepository.findById;
    eventsRepository.findById = async () => null;
    try {
        await assert.rejects(eventsService.getById('507f1f77bcf86cd799439011'), (error) => error.statusCode === 404);
    } finally { eventsRepository.findById = original; }
});
