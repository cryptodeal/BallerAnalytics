<script lang="ts">
	import IconPerson from '~icons/fluent/person-24-regular';
	import { session } from '$app/stores';

	export let modalId: string, triggerTxt: string, closeDrawer: () => void;
</script>

{#if $session.user}
	<!--Start TailwindCSS dropdown menu-->
	<div class="group">
		<button class="btn inline-flex items-center mx-2 focus:outline-none" on:click={closeDrawer}>
			<IconPerson class="h-6 w-6" />
		</button>
		<div class="absolute right-4 z-10 hidden group-hover:block">
			<div class="p-1 mt-1 glassmorphicCard shadow-lg rounded-xl">
				<div class="flex flex-col gap-2 py-3 px-2 max-w-[200px]">
					<a href="/profile" class="w-full m-0">
						<button class="btn bg-transparent glassmorphicCard hover:bg-transparent">
							profile
						</button>
					</a>
					<a href="/logout" class="w-full m-0">
						<button class="btn bg-transparent glassmorphicCard hover:bg-transparent">
							logout
						</button>
					</a>
				</div>
			</div>
		</div>
	</div>
	<!--End TailwindCSS dropdown menu-->
{:else}
	<label for={modalId} class="btn mx-2" on:click={closeDrawer}>{triggerTxt}</label>
{/if}
