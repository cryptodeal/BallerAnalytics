import config from '$lib/_config';
import jwt from 'jsonwebtoken';
/** TODO: Return false if no auth; else return user scope (permissions) as string */
const protect = (accessToken: string): void => {
	return jwt.verify(accessToken, config.JWT_SECRET, function (err, decoded) {
		if (err) throw new Error(`Error: ${err}`);
		console.log(decoded);
	});
};
export default protect;
