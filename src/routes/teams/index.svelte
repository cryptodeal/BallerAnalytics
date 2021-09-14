<script context="module">
	export async function load({ fetch }) {
		const url = `/teams.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { teams } = await res.json();
			return {
				props: {
					teams
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script>
	export let teams;
	//console.log(teams)
</script>

{#each teams as { infoCommon }}
	<a sveltekit:prefetch href="/teams/{infoCommon.slug}">
		<div class="container mx-auto my-4">
			<div class="rounded-lg shadow-lg bg-gray-600 w-full flex flex-row flex-wrap p-3">
				<div class="md:w-1/8 w-full">
					<img
						class="rounded-lg shadow-lg md:max-h-30 antialiased"
						src="teams/{infoCommon.slug}.svg"
						alt="{infoCommon.city} {infoCommon.name} logo"
					/>
				</div>
				<div class="md:w-7/8 w-full px-3 flex flex-row flex-wrap">
					<div
						class="w-full text-center text-gray-700 font-semibold relative pt-3 md:(pt-0 text-right)"
					>
						<div class="text-2xl text-white leading-tight">{infoCommon.city} {infoCommon.name}</div>
						<div class="text-normal text-gray-300 hover:text-gray-400 cursor-pointer">
							<span class="pb-1">{infoCommon.minYear} - {infoCommon.maxYear}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</a>
{/each}
