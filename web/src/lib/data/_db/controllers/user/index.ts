import { User } from '@balleranalytics/nba-api-ts';
import type { UserDocument } from '@balleranalytics/nba-api-ts';

export const findUserById = (id: string): Promise<UserDocument | null> => {
	return User.findById(id).select('email username scope name.first name.last').exec();
};
