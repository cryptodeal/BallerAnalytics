<script lang="ts">
	import AuthButton from '$lib/ux/nav/AuthButton.svelte';
	const modalId = 'auth-modal',
		triggerTxt = 'login / register';
	export let segment: string;
	export let closeDrawer: () => void;
</script>

<ul class="menu p-4 overflow-y-auto w-80 bg-base-100">
	<!-- Sidebar content here -->
	<li>
		<AuthButton {modalId} {triggerTxt} {closeDrawer} />
	</li>
	<li>
		<a
			sveltekit:prefetch
			on:click={closeDrawer}
			href="/games"
			class="uppercase"
			aria-current={segment === 'games' ? 'page' : undefined}
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
			aria-current={segment === 'players' ? 'page' : undefined}
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
			aria-current={segment === 'teams' ? 'page' : undefined}
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
			aria-current={segment === 'articles' ? 'page' : undefined}
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
			aria-current={segment === 'dev' ? 'page' : undefined}
		>
			NEAT
		</a>
	</li>
</ul>
