import mongoose from 'mongoose';

import eventsRepository from '../repositories/events.repository.js';
import HttpError from '../utils/http-error.js';
import EventDTO from '../dto/event.dto.js';

const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'finished'];
const EDITABLE_FIELDS = ['title', 'description', 'category', 'date', 'location', 'capacity', 'price'];
const SORTABLE_FIELDS = ['date', 'title', 'category', 'location', 'capacity', 'price', 'createdAt'];

const requireValidId = (id) => {
    if (!mongoose.isValidObjectId(id)) throw new HttpError('Evento no encontrado', 404);
};

const requireNonEmptyText = (value, field) => {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new HttpError(`El campo ${field} es obligatorio`, 400);
    }
};

const validateNumbers = (data) => {
    if ('capacity' in data && (!Number.isFinite(data.capacity) || data.capacity <= 0)) {
        throw new HttpError('La capacidad debe ser mayor que 0', 400);
    }
    if ('price' in data && (!Number.isFinite(data.price) || data.price < 0)) {
        throw new HttpError('El precio debe ser mayor o igual que 0', 400);
    }
};

const parseDate = (value, field = 'date') => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new HttpError(`El campo ${field} contiene una fecha inválida`, 400);
    }
    return date;
};

const parsePositiveInteger = (value, fallback, field, max) => {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || (max && parsed > max)) {
        throw new HttpError(`${field} debe ser un entero positivo${max ? ` de hasta ${max}` : ''}`, 400);
    }
    return parsed;
};

class EventsService {
    async getAll(query = {}) {
        const filter = {};
        if (query.status) {
            if (!EVENT_STATUSES.includes(query.status)) throw new HttpError('Estado de evento inválido', 400);
            filter.status = query.status;
        }
        if (query.category) filter.category = query.category;
        if (query.location) filter.location = query.location;

        if (query.dateFrom || query.dateTo) {
            filter.date = {};
            if (query.dateFrom) filter.date.$gte = parseDate(query.dateFrom, 'dateFrom');
            if (query.dateTo) filter.date.$lte = parseDate(query.dateTo, 'dateTo');
            if (filter.date.$gte && filter.date.$lte && filter.date.$gte > filter.date.$lte) {
                throw new HttpError('dateFrom no puede ser posterior a dateTo', 400);
            }
        }

        const page = parsePositiveInteger(query.page, 1, 'page');
        const limit = parsePositiveInteger(query.limit, 10, 'limit', 100);
        const rawSort = query.sort || 'date';
        const descending = rawSort.startsWith('-');
        const sortField = descending ? rawSort.slice(1) : rawSort;
        if (!SORTABLE_FIELDS.includes(sortField)) throw new HttpError('Campo de ordenamiento inválido', 400);

        const { data, total } = await eventsRepository.getAll(filter, {
            skip: (page - 1) * limit,
            limit,
            sort: { [sortField]: descending ? -1 : 1 },
        });
        return { data: data.map((event) => new EventDTO(event)), page, limit, total, totalPages: Math.ceil(total / limit) };
    }

    async getById(id) {
        requireValidId(id);
        const event = await eventsRepository.findById(id);
        if (!event) throw new HttpError('Evento no encontrado', 404);
        return new EventDTO(event);
    }

    async create(eventData, user) {
        for (const field of ['title', 'description', 'category', 'location']) {
            requireNonEmptyText(eventData[field], field);
        }
        if (eventData.date === undefined) throw new HttpError('El campo date es obligatorio', 400);
        if (eventData.capacity === undefined) throw new HttpError('El campo capacity es obligatorio', 400);
        if (eventData.price === undefined) throw new HttpError('El campo price es obligatorio', 400);
        validateNumbers(eventData);

        const date = parseDate(eventData.date);
        if (date <= new Date()) throw new HttpError('La fecha del evento no puede estar en el pasado', 400);
        const status = eventData.status ?? 'draft';
        if (!EVENT_STATUSES.includes(status)) throw new HttpError('Estado de evento inválido', 400);
        if (['cancelled', 'finished'].includes(status)) {
            throw new HttpError('Un evento nuevo no puede estar cancelado o finalizado', 400);
        }

        const safeData = Object.fromEntries(
            Object.entries(eventData).filter(([key]) => [...EDITABLE_FIELDS, 'status'].includes(key)),
        );
        return new EventDTO(await eventsRepository.create({ ...safeData, date, status, organizer: user.id }));
    }

    async update(id, changes, user) {
        const event = await this.getById(id);
        this.assertCanModify(event, user);
        this.assertNotCancelled(event);
        const safeChanges = Object.fromEntries(
            Object.entries(changes).filter(([key]) => EDITABLE_FIELDS.includes(key)),
        );
        for (const field of ['title', 'description', 'category', 'location']) {
            if (field in safeChanges) requireNonEmptyText(safeChanges[field], field);
        }
        validateNumbers(safeChanges);
        if ('date' in safeChanges) {
            safeChanges.date = parseDate(safeChanges.date);
            if (safeChanges.date <= new Date()) {
                throw new HttpError('La fecha del evento no puede estar en el pasado', 400);
            }
        }
        if (Object.keys(safeChanges).length === 0) throw new HttpError('No se enviaron campos editables', 400);
        return new EventDTO(await eventsRepository.updateById(id, safeChanges));
    }

    async changeStatus(id, status, user) {
        if (!EVENT_STATUSES.includes(status)) throw new HttpError('Estado de evento inválido', 400);
        const event = await this.getById(id);
        this.assertCanModify(event, user);
        this.assertNotCancelled(event);
        if (status === 'published' && (event.status === 'finished' || event.date <= new Date())) {
            throw new HttpError('No se puede publicar un evento finalizado', 400);
        }
        return new EventDTO(await eventsRepository.updateById(id, { status }));
    }

    assertCanModify(event, user) {
        const ownsEvent = event.organizer.toString() === user.id;
        if (user.role !== 'admin' && !ownsEvent) {
            throw new HttpError('No tenés permisos para modificar este evento', 403);
        }
    }

    assertNotCancelled(event) {
        if (event.status === 'cancelled') {
            throw new HttpError('Los eventos cancelados no pueden modificarse', 409);
        }
    }
}

export default new EventsService();
