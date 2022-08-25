import { derived } from 'svelte/store';
import { page } from '$app/stores';

/**
 * Session store, derived from the page store.
 */
export const session = derived(page, ($page) => {
	return $page?.data?.session ?? null;
});
