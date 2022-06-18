import { User, castToObjectId } from '@balleranalytics/nba-api-ts';
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
			const { name, teamSubs, birthdate } = formData;
			const { first, last } = name;
			user.name = { first, last };
			user.birthdate = birthdate;
			user.subscriptions.teams.splice(0);
			for (let i = 0; i < teamSubs.length; i++) {
				user.subscriptions.teams.addToSet(castToObjectId(teamSubs[i]));
			}
			return user.save();
		});
};

export const updateUserData = (
	userId: string,
	formData: NewUserFormData
): Promise<UserDocument> => {
	return User.findById(userId)
		.exec()
		.then((user) => {
			if (!user) throw Error('no user found with matching userId');
			const { teamSubs } = formData;
			user.subscriptions.teams.splice(0);
			for (let i = 0; i < teamSubs.length; i++) {
				user.subscriptions.teams.addToSet(castToObjectId(teamSubs[i]));
			}
			return user.save();
		});
};
