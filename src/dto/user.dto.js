const documentToObject = (document) => document?.toObject?.() ?? document ?? {};

export class UserDTO {
    constructor(user, { preserveMongoId = false } = {}) {
        const data = documentToObject(user);
        if (preserveMongoId && data._id !== undefined) this._id = data._id;
        else if (data._id ?? data.id) this.id = (data._id ?? data.id).toString();
        if (data.first_name !== undefined) this.first_name = data.first_name;
        if (data.last_name !== undefined) this.last_name = data.last_name;
        this.email = data.email;
        this.role = data.role;
    }
}

export default UserDTO;
