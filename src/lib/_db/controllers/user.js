import { User } from '$lib/_db/models';

const findUserById = (id) => {
	return User.findById(id).select('email username scope name.first name.last').exec();
};

export { findUserById };