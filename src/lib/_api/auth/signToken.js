import jwt from 'jsonwebtoken';

const signToken = (id) => {
	return jwt.sign({ id }, import.meta.env.VITE_JWT_SECRET, {
		expiresIn: import.meta.env.VITE_JWT_EXPIRY
	});
};

export default signToken;
