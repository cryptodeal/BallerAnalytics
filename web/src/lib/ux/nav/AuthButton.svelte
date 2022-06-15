<script lang="ts">
	import IconPerson from '~icons/fluent/person-24-regular';
	import { session } from '$app/stores';

	export let modalId: string, triggerTxt: string, closeDrawer: () => void;
</script>

{#if $session.user}
	<!--Start TailwindCSS dropdown menu-->
	<div class="dropdown dropdown-hover dropdown-end">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label tabindex="0" class="btn m-1">
			<IconPerson class="h-6 w-6 fill-current" />
		</label>
		<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52">
			<li><a href="/profile">profile</a></li>
			<li><a href="/logout">logout</a></li>
		</ul>
	</div>
	<!--End TailwindCSS dropdown menu-->
{:else}
	<label for={modalId} class="btn mx-2" on:click={closeDrawer}>{triggerTxt}</label>
{/if}
