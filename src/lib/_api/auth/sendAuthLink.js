import { User } from '$lib/_db/models';
import Email from '$lib/_api/auth/email';

const sendAuthLink = async (email) => {
	// Get user from body.email
	let user = await User.findOne({ email: email });

	if (!user) {
		user = await User.create({
			email: email
		});
	}

	// Generate random auth token
	const authToken = user.createAuthToken();
	await user.save({ validateBeforeSave: false });

	const authLink = `http://localhost:3000/api/auth/verify/${authToken}`;

	try {
		await new Email(user, authLink).sendMagicLink();
		return true;
	} catch (err) {
		console.log(err);
		user.authLoginToken = undefined;
		user.authLoginExpires = undefined;
		await user.save({ validateBeforeSave: false });
		return err;
	}
};

export default sendAuthLink;
