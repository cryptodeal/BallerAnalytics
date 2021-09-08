import cookie from 'cookie';
//import jwt from 'jsonwebtoken'

const protect = async (request) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	let token;

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
