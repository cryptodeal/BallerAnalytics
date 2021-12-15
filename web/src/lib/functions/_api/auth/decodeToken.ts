import jwt from 'jsonwebtoken';

const decodeToken = (token: string) => {
	return jwt.decode(token, { complete: true });
};

export default decodeToken;
