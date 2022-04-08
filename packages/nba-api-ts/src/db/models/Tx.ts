import mongoose from 'mongoose';
import type { TxModel, TxSchema } from '../interfaces/mongoose.gen';

const TxSchema = new mongoose.Schema({
	date: { type: Date, required: true },
	season: { type: Number, required: true },
	participants: [
		{
			team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2', index: true, required: true },
			received: {
				players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player2' }],
				coaches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coach2' }],
				assets: [{ type: String }]
			},
			spent: {
				players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player2' }],
				coaches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coach2' }],
				assets: [{ type: String }]
			}
		}
	]
});

export const Tx: TxModel = (mongoose.models.Tx as TxModel) || mongoose.model('Tx', TxSchema);
