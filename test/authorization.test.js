import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

const { default: authMiddleware } = await import(
    '../src/middlewares/auth.middleware.js'
);
const { default: initializePassport } = await import(
    '../src/config/passport.config.js'
);
const { default: authorize } = await import(
    '../src/middlewares/authorize.middleware.js'
);
const { default: eventsService } = await import(
    '../src/services/events.service.js'
);
const { default: eventsRepository } = await import(
    '../src/repositories/events.repository.js'
);

initializePassport();

const responseMock = () => {
    const response = {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
    return response;
};

test('una ruta privada sin cookie produce un error 401', async () => {
    const error = await new Promise((resolve) => {
        authMiddleware({ cookies: {}, headers: {} }, responseMock(), resolve);
    });
    assert.equal(error.statusCode, 401);
    assert.equal(error.message, 'No autenticado');
});

test('un token expirado produce un error 401', async () => {
    const token = jwt.sign(
        { id: '1', email: 'user@example.com', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: -1 },
    );
    const error = await new Promise((resolve) => {
        authMiddleware({ cookies: { currentUser: token }, headers: {} }, responseMock(), resolve);
    });
    assert.equal(error.statusCode, 401);
    assert.equal(error.message, 'No autenticado');
});

test('un user autenticado no puede crear eventos', () => {
    const response = responseMock();

    authorize('organizer', 'admin')(
        { user: { role: 'user' } },
        response,
        () => assert.fail('no debe continuar'),
    );

    assert.equal(response.statusCode, 403);
});

test('organizer y admin pueden crear eventos', () => {
    for (const role of ['organizer', 'admin']) {
        let called = false;
        authorize('organizer', 'admin')(
            { user: { role } },
            responseMock(),
            () => {
                called = true;
            },
        );
        assert.equal(called, true);
    }
});

test('la ruta administrativa rechaza organizer y acepta admin', () => {
    const forbiddenResponse = responseMock();
    authorize('admin')(
        { user: { role: 'organizer' } },
        forbiddenResponse,
        () => assert.fail('no debe continuar'),
    );
    assert.equal(forbiddenResponse.statusCode, 403);

    let adminAccepted = false;
    authorize('admin')(
        { user: { role: 'admin' } },
        responseMock(),
        () => {
            adminAccepted = true;
        },
    );
    assert.equal(adminAccepted, true);
});

test('un organizer no puede modificar un evento ajeno', async () => {
    const originalFindById = eventsRepository.findById;
    eventsRepository.findById = async () => ({
        organizer: { toString: () => 'owner-id' },
    });

    try {
        await assert.rejects(
            eventsService.update(
                '507f1f77bcf86cd799439011',
                { title: 'Cambio' },
                { id: 'another-id', role: 'organizer' },
            ),
            (error) => error.statusCode === 403,
        );
    } finally {
        eventsRepository.findById = originalFindById;
    }
});
