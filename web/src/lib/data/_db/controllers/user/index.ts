import { User } from '@balleranalytics/nba-api-ts';
import type { UserDocument } from '@balleranalytics/nba-api-ts';
import type { NewUserFormData } from '$lib/types';

export const findUserById = (id: string): Promise<UserDocument | null> => {
	return User.findById(id)
		.select('email username scope name subscriptions birthdate createdAt')
		.populate('subscriptions.teams', 'infoCommon seasons')
		.exec();
};

export const addNewUserFormData = (
	userId: string,
	formData: NewUserFormData
): Promise<UserDocument> => {
	return User.findById(userId)
		.exec()
		.then((user) => {
			if (!user) throw Error('no user found with matching userId');
			const { first, last } = formData.name;
			const { teams, players } = formData.subscriptions;
			user.name = { first, last };
			user.birthdate = formData.birthdate;
			user.subscriptions = { teams, players };
			return user.save();
		});
};
