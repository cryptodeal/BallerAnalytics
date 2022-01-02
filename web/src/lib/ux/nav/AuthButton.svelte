<script lang="ts">
	import AuthModal from '$lib/ux/nav/AuthModal.svelte';
	import IconPerson from '~icons/fluent/person-24-regular';
	import { session } from '$app/stores';
</script>

{#if $session.user}
	<!--Start WindiCSS dropdown menu-->
	<div class="group">
		<button class="flex inline-flex items-center mx-2 focus:outline-none">
			<IconPerson class="h-6 w-6" />
		</button>
		<div class="absolute right-4 mt-1 z-10 hidden group-hover:(block)">
			<div class="px-2 mt-3 glassmorphicBg pt-2 shadow-lg rounded-xl">
				<div class="flex flex-col py-4 px-2 w-200px max-w-200px">
					<div class="pb-4 block w-full m-0">
						<a href="/profile" class="w-full m-0">
							<button
								class="w-full inline-flex items-center rounded-md bg-transparent hover:(bg-dark-900 !text-white)"
							>
								profile
							</button>
						</a>
						<a href="/logout" class="w-full m-0">
							<button
								class="w-full inline-flex items-center bg-transparent hover:(bg-dark-900 !text-white)"
							>
								logout
							</button>
						</a>
					</div>
					<hr class="mb-4 bg-blue-600 border-none h-1px overflow-hidden" />
				</div>
			</div>
		</div>
	</div>
	<!--End WindiCSS dropdown menu-->
{:else}
	<button class="font-medium uppercase md:(w-auto ml-2)">
		<AuthModal />
	</button>
{/if}
