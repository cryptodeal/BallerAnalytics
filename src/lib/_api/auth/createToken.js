import crypto from 'crypto';
import signToken from '$lib/_api/auth/signToken';
//import { User } from '$lib/_db/models';
import * as cookie from 'cookie';

const createToken = async (userId) => {
	const tokenPayload = signToken(userId);

	//Generate random refresh token
	const refreshTokenPayload = crypto.randomBytes(32).toString('hex');

	//const hashedRefreshToken = crypto.createHash('sha256').update(refreshTokenPayload).digest('hex');

	//const refreshExp = new Date().setDate(new Date().getDate() + 7);

	/* 
    await User.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: {
          token: hashedRefreshToken,
          expiration: refreshExp
        },
      },
    });
  */

	const accessToken = cookie.serialize('accessToken', tokenPayload, {
		httpOnly: true,
		sameSite: import.meta.env.VITE_NODE_ENV == 'production' ? 'none' : 'Lax',
		secure: import.meta.env.VITE_NODE_ENV == 'production' ? true : false,
		maxAge: 1800000
	});

	const refreshToken = cookie.serialize('refreshToken', refreshTokenPayload, {
		httpOnly: true,
		sameSite: import.meta.env.VITE_NODE_ENV == 'production' ? 'none' : 'Lax',
		secure: import.meta.env.VITE_NODE_ENV == 'production' ? true : false,
		maxAge: 604800000
	});

	return { accessToken, refreshToken };
};

export default createToken;
