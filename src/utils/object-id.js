import mongoose from 'mongoose';

export const isValidObjectId = (id) => mongoose.isValidObjectId(id);
