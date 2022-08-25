import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { user } = locals; // create|assign|attach session to `locals` in handle hook
	return {
		session: { user },
		path: url.pathname
	};
};
