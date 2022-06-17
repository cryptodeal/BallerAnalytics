<script lang="ts">
	import IconPerson from '~icons/fluent/person-24-regular';
	import { session } from '$app/stores';

	export let modalId: string, triggerTxt: string, closeDrawer: () => void;
</script>

{#if $session.user}
	<!--Start TailwindCSS dropdown menu-->
	<div class="hidden lg:dropdown dropdown-hover dropdown-end">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label tabindex="0" class="btn">
			<IconPerson class="h-6 w-6 fill-current" />
		</label>
		<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52">
			<li>
				<a sveltekit:prefetch class="uppercase" href="/profile"> profile </a>
			</li>
			<li>
				<a class="uppercase" href="/logout"> logout </a>
			</li>
		</ul>
	</div>

	<div class="dropdown dropdown-left lg:hidden">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label tabindex="0" class="btn m-1">
			<IconPerson class="h-6 w-6 fill-current" />
		</label>
		<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-32">
			<li>
				<a on:click={closeDrawer} sveltekit:prefetch class="uppercase" href="/profile"> profile </a>
			</li>
			<li>
				<a on:click={closeDrawer} class="uppercase" href="/logout"> logout </a>
			</li>
		</ul>
	</div>
	<!--End TailwindCSS dropdown menu-->
{:else}
	<label for={modalId} class="btn" on:click={closeDrawer}>{triggerTxt}</label>
{/if}
