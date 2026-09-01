import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Exclude password from query results by default
        },
        role: {
            type: String,
            enum: ['user', 'admin','organizer'],
            default: 'user',
        },
    },
    {
        timestamps: true,
        versionKey: false, // Disable the __v field
    },
);

const User = mongoose.model('User', userSchema);

export default User;