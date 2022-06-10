<script lang="ts">
	import AuthButton from '$lib/ux/nav/AuthButton.svelte';
	const modalId = 'auth-modal',
		triggerTxt = 'login / register';
	export let segment: string;
</script>

<div class="drawer-side">
	<label for="navDrawer" class="drawer-overlay" />
	<ul class="menu p-4 overflow-y-auto w-80 bg-base-100">
		<!-- Sidebar content here -->
		<li>
			<AuthButton {modalId} {triggerTxt} />
		</li>
		<li>
			<a
				sveltekit:prefetch
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
				href="/dev/neat"
				class="uppercase"
				aria-current={segment === 'dev' ? 'page' : undefined}
			>
				NEAT
			</a>
		</li>
	</ul>
</div>
