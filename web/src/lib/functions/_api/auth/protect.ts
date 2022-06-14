import config from '$lib/_config';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

const protect = (headers: Headers): JwtPayload | string => {
	const cookies = cookie.parse(headers.get('cookie') || '');
	console.log(cookies);
	const { accessToken } = cookies;
	if (accessToken) {
		return jwt.verify(accessToken, config.JWT_SECRET);
	}
	throw new Error(`Error: no accessToken cookie found; unable to authenticate request`);
};

export default protect;
