import mongoose from 'mongoose';
import type {
	Official2Document,
	Official2Model,
	Official2Schema
} from '../interfaces/mongoose.gen';

const Official2Schema: Official2Schema = new mongoose.Schema({
	meta: {
		helpers: {
			nbaOfficialId: { type: String },
			bballRef: {
				officialUrl: { type: String, required: true, unique: true }
			}
		}
	},
	name: {
		full: { type: String, required: true },
		parsed: [{ type: String }]
	},
	seasons: [
		{
			year: { type: Number, required: true },
			preseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }]
			},
			regularSeason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }]
			},
			postseason: {
				exists: { type: Boolean, required: true, default: false },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }]
			}
		}
	]
});

Official2Schema.statics = {
	findByUrl(url: string) {
		return this.findOne({ 'meta.helpers.bballRef.officialUrl': url }).exec();
	},

	findByName(name: string | string[]) {
		return this.find({ 'name.full': Array.isArray(name) ? { $in: name } : name }).exec();
	},

	findByNameOrNbaId(name: string | string[], nbaId: string) {
		return this.findOne({
			$or: [
				{ 'name.full': Array.isArray(name) ? { $in: name } : name },
				{ 'name.parsed': Array.isArray(name) ? { $in: name } : name },
				{ 'meta.helpers.nbaOfficialId': nbaId }
			]
		}).exec();
	}
};

export const Official2: Official2Model = mongoose.model<Official2Document, Official2Model>(
	'Official2',
	Official2Schema
);
