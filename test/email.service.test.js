import assert from 'node:assert/strict';
import test from 'node:test';

import emailService from '../src/services/email.service.js';

test('el correo de cancelación incluye destinatario y datos de la reserva', async (t) => {
    let message;
    t.mock.method(emailService, 'getTransporter', () => ({
        sendMail: async (data) => { message = data; },
    }));
    await emailService.sendTicketCancellation({
        to: 'owner@mail.com',
        event: { title: 'Open marcial', date: new Date('2030-01-01T12:00:00Z'), location: 'Dojo central' },
        ticket: { reservationCode: 'ABC-123', quantity: 2 },
    });
    assert.equal(message.to, 'owner@mail.com');
    assert.equal(message.subject, 'Inscripción cancelada: Open marcial');
    assert.match(message.text, /ABC-123/);
    assert.match(message.text, /Cantidad: 2/);
    assert.match(message.text, /Dojo central/);
});
