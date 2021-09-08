import jwt from 'jsonwebtoken';

const decodeToken = (token) => {
	const decoded = jwt.decode(token, { complete: true });
	return decoded;
};

export default decodeToken;
