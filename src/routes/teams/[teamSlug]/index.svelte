<script context="module">
	export async function load({ fetch, page }) {
		const url = `/teams/${page.params.teamSlug}.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { teamData } = await res.json();
			return {
				props: {
					teamData
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
	export let teamData;
	console.log(teamData.availableSeasons[teamData.availableSeasons.length - 1]);
</script>

<div class="w-full m-0 p-0 bg-red-900">
	<div class="container max-w-4xl mx-auto text-center break-normal">
		<h1 class="font-sans py-10 text-white font-bold text-3xl md:(text-5xl py-20)">
			{teamData.infoCommon.city}
			{teamData.infoCommon.name}
		</h1>
	</div>
</div>
