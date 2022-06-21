<script lang="ts">
	import AuthButton from '$lib/ux/nav/AuthButton.svelte';
	const modalId = 'auth-modal',
		triggerTxt = 'login / register';
	export let segment: string;
	export let closeDrawer: () => void;
</script>

<div
	class="bg-base-200 sticky top-0 z-10 grid grid-row-2 gap-y-2 w-full bg-opacity-90 py-3 px-2 backdrop-blur lg:hidden"
>
	<AuthButton {modalId} {triggerTxt} {closeDrawer} />
</div>

<div class="h-12" />

<ul class="menu p-4 overflow-y-auto w-80 bg-base-100">
	<!-- Sidebar content here -->
	<li>
		<a
			sveltekit:prefetch
			on:click={closeDrawer}
			href="/games"
			class="uppercase"
			class:active={segment === 'games' ? true : false}
		>
			games
		</a>
	</li>
	<li>
		<a
			sveltekit:prefetch
			on:click={closeDrawer}
			href="/players"
			class="uppercase"
			class:active={segment === 'players' ? true : false}
		>
			players
		</a>
	</li>

	<li>
		<a
			sveltekit:prefetch
			on:click={closeDrawer}
			href="/teams"
			class="uppercase"
			class:active={segment === 'teams' ? true : false}
		>
			teams
		</a>
	</li>

	<li>
		<a
			sveltekit:prefetch
			on:click={closeDrawer}
			href="/articles"
			class="uppercase"
			class:active={segment === 'articles' ? true : false}
		>
			articles
		</a>
	</li>

	<li>
		<a
			sveltekit:prefetch
			on:click={closeDrawer}
			href="/dev/neat"
			class="uppercase"
			class:active={segment === 'dev' ? true : false}
		>
			NEAT
		</a>
	</li>
</ul>
