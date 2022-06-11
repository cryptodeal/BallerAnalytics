import { writable } from 'svelte/store';

const storedTheme =
	typeof document === 'undefined' || localStorage.getItem('theme') === 'night' ? true : false;
const theme = writable(storedTheme);
export default theme;
theme.subscribe((value) => {
	if (typeof document === 'undefined') return;
	localStorage.setItem('theme', value ? 'night' : 'corporate');
});
