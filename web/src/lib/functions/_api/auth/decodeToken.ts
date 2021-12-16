import jwt from 'jsonwebtoken';

const decodeToken = (token: string): jwt.Jwt | null => {
	return jwt.decode(token, { complete: true });
};

export default decodeToken;
