import UserDTO from './user.dto.js';

const toObject = (document) => document?.toObject?.() ?? document ?? {};

export default class EventDTO {
    constructor(event) {
        const data = toObject(event);
        if (data._id !== undefined) this._id = data._id;
        else if (data.id !== undefined) this.id = data.id.toString();
        for (const field of ['title', 'description', 'category', 'date', 'location', 'capacity', 'price', 'status', 'createdAt', 'updatedAt']) {
            if (data[field] !== undefined) this[field] = data[field];
        }
        if (data.organizer !== undefined) {
            this.organizer = data.organizer && typeof data.organizer === 'object' && (data.organizer.email || data.organizer.first_name)
                ? new UserDTO(data.organizer, { preserveMongoId: true })
                : data.organizer?.toString();
        }
    }
}
