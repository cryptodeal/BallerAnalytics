import mongoose from 'mongoose';

const Official2Schema = new mongoose.Schema({
	meta: {
		helpers: {
			nbaOfficialId: { type: Number },
			bballRef: {
				officialUrl: { type: String, required: true, unique: true }
			}
		}
	},
	name: {
		full: { type: String, required: true }
	},
	seasons: [
		{
			year: { type: Number },
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

	findByName(name: string) {
		return this.find({ 'name.full': name }).exec();
	}
};

export const Official2 = mongoose.model('Official2', Official2Schema);
