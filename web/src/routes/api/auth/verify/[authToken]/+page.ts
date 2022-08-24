import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const url = `/api/auth/verify/${params.authToken}.json`;

	/*const res = await fetch(url);
	if (res.ok) {
		await res.json();
		return {
			
        props: {
				msg: res.msg
        }
        
			status: 302,
			redirect: '/profile'
		};
	}*/

	return {
		url
	};
};
