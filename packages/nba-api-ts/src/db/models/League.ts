import mongoose from 'mongoose';
import type { LeagueDocument, LeagueModel, LeagueSchema } from '../interfaces/mongoose.gen';

const LeagueSchema: LeagueSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	seasons: [
		{
			year: { type: Number, required: true },
			displaySeason: { type: String, required: true },
			games: {
				preseason: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				regularSeason: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				postSeason: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }]
			},
			teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team2', many: true }],
			champion: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2' },
			awards: {
				mvp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player2', many: true }],
				roty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player2', many: true }],
				dpoy: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
				mostImproved: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
				sixthMan: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' }
			},
			leaders: {
				points: {
					leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
					value: { type: Number }
				},
				assists: {
					leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
					value: { type: Number }
				},
				rebounds: {
					leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
					value: { type: Number }
				},
				winShare: {
					leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
					value: { type: Number }
				}
			}
		}
	]
});

export const League: LeagueModel = mongoose.model<LeagueDocument, LeagueModel>(
	'League',
	LeagueSchema
);
