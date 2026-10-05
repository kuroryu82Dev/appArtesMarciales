import EventDTO from './event.dto.js';
import UserDTO from './user.dto.js';

const toObject = (document) => document?.toObject?.() ?? document ?? {};

export default class TicketDTO {
    constructor(ticket) {
        const data = toObject(ticket);
        if (data._id !== undefined) this._id = data._id;
        else if (data.id !== undefined) this.id = data.id.toString();
        this.reservationCode = data.reservationCode;
        this.status = data.status;
        this.quantity = data.quantity;
        this.cancelledAt = data.cancelledAt;
        this.user = data.user && typeof data.user === 'object' && data.user.email ? new UserDTO(data.user, { preserveMongoId: true }) : data.user?.toString();
        this.event = data.event && typeof data.event === 'object' && data.event.title ? new EventDTO(data.event) : data.event?.toString();
        if (data.createdAt !== undefined) this.createdAt = data.createdAt;
        if (data.updatedAt !== undefined) this.updatedAt = data.updatedAt;
    }
}
