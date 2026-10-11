import assert from 'node:assert/strict';
import test from 'node:test';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'http-test-secret';
const { default: app } = await import('../src/app.js');
const { default: users } = await import('../src/repositories/users.repository.js');

test('flujo HTTP de registro, login, current, permisos y logout', async (t) => {
    const originals = { findByEmail: users.findByEmail, create: users.create, findByEmailWithPassword: users.findByEmailWithPassword };
    let saved;
    users.findByEmail = async () => saved;
    users.create = async (data) => { saved = { ...data, _id: '507f1f77bcf86cd799439011' }; return saved; };
    users.findByEmailWithPassword = async () => saved;
    const server = app.listen(0, '127.0.0.1');
    t.after(async () => {
        Object.assign(users, originals);
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
    });
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const request = (path, body, cookie) => fetch(base + path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = { first_name: 'Ana', last_name: 'Perez', email: 'ANA@example.com', password: 'Secreta123', role: 'admin' };
    let response = await request('/sessions/register', data);
    assert.equal(response.status, 201);
    const registered = await response.json();
    assert.equal(registered.payload.role, 'user');
    assert.equal(registered.payload.email, 'ana@example.com');
    assert.equal(JSON.stringify(registered).includes('password'), false);
    assert.notEqual(saved.password, data.password);
    assert.equal((await request('/sessions/register', data)).status, 409);
    assert.equal((await request('/sessions/login', { email: data.email, password: 'incorrecta' })).status, 401);
    response = await request('/sessions/login', data);
    assert.equal(response.status, 200);
    const setCookie = response.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/i);
    const cookie = setCookie.split(';')[0];
    const payload = jwt.verify(decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1)), process.env.JWT_SECRET);
    assert.equal('password' in payload, false);
    response = await request('/sessions/current', undefined, cookie);
    assert.equal(response.status, 200);
    assert.equal(JSON.stringify(await response.json()).includes('password'), false);
    assert.equal((await request('/events', {}, cookie)).status, 403);
    assert.equal((await request('/events', {})).status, 401);
    response = await request('/sessions/logout', {}, cookie);
    assert.equal(response.status, 200);
    const clearedCookie = response.headers.get('set-cookie').split(';')[0];
    assert.equal((await request('/sessions/current', undefined, clearedCookie)).status, 401);
    response = await fetch(base + '/sessions/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(response.status, 400);
});
