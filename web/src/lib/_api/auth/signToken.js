import jwt from 'jsonwebtoken';

const signToken = (user) => {
	const claims = {
		email: user.email,
		username: user.username,
		scope: user.scope,
		id: user._id
	};
	return jwt.sign(claims, import.meta.env.VITE_JWT_SECRET, {
		expiresIn: import.meta.env.VITE_JWT_EXPIRY
	});
};

export default signToken;
