import cookie from 'cookie';
//import jwt from 'jsonwebtoken'
import type { ServerRequest } from '@sveltejs/kit/types/hooks';

/** TODO: Return false if no auth; else return user scope (permissions) as string */
const protect = async (request: ServerRequest): Promise<boolean> => {
	const cookies = cookie.parse(request.headers.cookie || '');
	let token: undefined | string;

	if (cookies.accessToken) {
		token = cookies.accessToken;
	}
	if (!token) {
		return false;
	}

	//TODO: verify JWT && check scope of user
	return true;
};
export default protect;
