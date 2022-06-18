import mongoose from 'mongoose';

export const castToObjectId = (id: string): mongoose.Types.ObjectId =>
	new mongoose.Types.ObjectId(id);
