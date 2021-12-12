import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const castToObjectId = (idStr) => {
	return ObjectId(idStr);
};

const addPeriodValue = (period) => {
	switch (period) {
		case 'q1':
			return 1;
		case 'q2':
			return 2;
		case 'h1':
			return 3;
		case 'q3':
			return 4;
		case 'q4':
			return 5;
		case 'h2':
			return 6;
		default:
			return 6 + parseInt(period.slice(2));
	}
};
export { castToObjectId, addPeriodValue };
