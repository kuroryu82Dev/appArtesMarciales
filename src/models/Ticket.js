import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled'],
        default: 'confirmed',
        index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    reservationCode: { type: String, required: true, unique: true },
    cancelledAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

ticketSchema.index(
    { user: 1, event: 1 },
    { unique: true, partialFilterExpression: { status: 'confirmed' } },
);

export default mongoose.model('Ticket', ticketSchema);
