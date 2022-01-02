import config from '$lib/_config';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import type { RequestHeaders } from '@sveltejs/kit/types/helper';
import type { JwtPayload } from 'jsonwebtoken';

const protect = (headers: RequestHeaders): JwtPayload | string => {
	const cookies = cookie.parse(headers.cookie || '');
	const { accessToken } = cookies;
	if (accessToken) {
		return jwt.verify(accessToken, config.JWT_SECRET);
	}
	throw new Error(`Error: no accessToken cookie found; unable to authenticate request`);
};

export default protect;
