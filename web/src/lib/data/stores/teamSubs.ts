import { setContext, getContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import type { ObjectOption } from 'svelte-multiselect';

export function createTeamSubs(teams: ObjectOption[] = []) {
	setContext('teamSubs', writable(teams));
}

export function getTeamSubs() {
	return (
		(getContext('teamSubs') as Writable<ObjectOption[]>) ||
		(writable([]) as Writable<ObjectOption[]>)
	);
}
