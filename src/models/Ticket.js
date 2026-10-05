import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
}, { timestamps: true, versionKey: false });

ticketSchema.index(
    { user: 1, event: 1 },
    { unique: true, partialFilterExpression: { status: 'active' } },
);

export default mongoose.model('Ticket', ticketSchema);
