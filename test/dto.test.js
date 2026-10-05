import assert from 'node:assert/strict';
import test from 'node:test';

import TicketDTO from '../src/dto/ticket.dto.js';
import UserDTO from '../src/dto/user.dto.js';

test('UserDTO nunca expone password', () => {
    const dto = new UserDTO({ _id: 'user-id', email: 'user@mail.com', role: 'user', password: 'hash' });
    assert.equal(dto.password, undefined);
    assert.equal(dto.email, 'user@mail.com');
});

test('TicketDTO filtra password de usuario y organizador populados', () => {
    const dto = new TicketDTO({
        _id: 'ticket-id', code: 'ABC', status: 'active',
        user: { _id: 'user-id', email: 'user@mail.com', role: 'user', password: 'hash-user' },
        event: {
            _id: 'event-id', title: 'Evento', status: 'published',
            organizer: { _id: 'owner-id', email: 'owner@mail.com', role: 'organizer', password: 'hash-owner' },
        },
    });
    assert.equal(dto.user.password, undefined);
    assert.equal(dto.event.organizer.password, undefined);
});
