<script context="module">
	export async function load({ fetch, page }) {
		const url = `/admin/edit/${page.params.id}.json`;
		const res = await fetch(url);

		if (res.ok) {
			const { gameData } = await res.json();
			return {
				props: {
					gameData
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
	import EditBoxScore from '$lib/admin/EditBoxScore.svelte';
	export let gameData;
	$: console.log(gameData);
	let edit = false;
	let homeSelected = 'game';
	let visitorSelected = 'game';

	function saveGame() {
		return fetch(`/admin/edit/${gameData._id}.json`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				updates: {
					home: gameData.home.stats,
					visitor: gameData.visitor.stats,
					homePlayers: gameData.home.players,
					visitorPlayers: gameData.visitor.players
				}
			})
		})
			.then((res) => {
				if (res.ok) return res.json();
			})
			.then(console.log)
			.catch(console.trace);
	}

	const initPeriods = (gameData) => {
		const periods = {
			home: [],
			visitor: []
		};
		const mockValues = ['game', 'q1', 'q2', 'h1', 'q3', 'q4', 'h2'];

		mockValues.map((p) => {
			const period = {
				periodName: p
			};
			periods.home.push(period);
			periods.visitor.push(period);
		});
		/*if(gameData?.home?.stats?.totals) periods.home.push({ periodName: 'game' })
    if(gameData?.visitor?.stats?.totals) periods.visitor.push({ periodName: 'game' })
    if(gameData?.home?.stats?.periods?.length){
      gameData.home.stats.periods.map(({periodName}) => {
        periods.home.push({ periodName })
      })
    }
    if(gameData?.visitor?.stats?.periods?.length){
      gameData.visitor.stats.periods.map(({periodName}) => {
        periods.visitor.push({ periodName })
      })
    }*/
		return periods;
	};
	$: periods = gameData._id ? initPeriods(gameData) : { home: [], visitor: [] };
	//$: console.log(homeSelected, visitorSelected)
</script>

<div
	class="flex flex-col overflow-scroll justify-center bg-blue-700 bg-opacity-10 rounded-lg mx-2 my-4 xl:mx-10"
>
	<div class="text-center py-5">
		<h1>{gameData.visitor.team.infoCommon.name} @ {gameData.home.team.infoCommon.name}</h1>
	</div>
	<div class="justify-self-center spacing p-3 md:p-6">
		<div class="inline-flex justify-between md:w-1/2 2xl:w-1/3">
			<button class="inline-flex" on:click={() => (edit = !edit)}>
				<div class="mr-2">Edit Game</div>
				<svg
					class="h-6 w-6 self-center"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						d="M18.363 8.464l1.433 1.431-12.67 12.669-7.125 1.436 1.439-7.127 12.665-12.668 1.431 1.431-12.255 12.224-.726 3.584 3.584-.723 12.224-12.257zm-.056-8.464l-2.815 2.817 5.691 5.692 2.817-2.821-5.693-5.688zm-12.318 18.718l11.313-11.316-.705-.707-11.313 11.314.705.709z"
					/>
				</svg>
			</button>
			{#if edit}
				<button class="inline-flex" on:click={saveGame}>
					<div class="mr-2">Save</div>
					<svg
						class="h-6 w-6 self-center"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							d="M13 3h2.996v5h-2.996v-5zm11 1v20h-24v-24h20l4 4zm-17 5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171zm-3 10.171h-14v1h14v-1zm0 2h-14v1h14v-1zm0 2h-14v1h14v-1z"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
	<div class="justify-self-center spacing p-3 md:p-6">
		<div class="flex inline-flex justify-between py-5 md:w-1/2 2xl:w-1/3">
			<h2 class="my-2">Home: {gameData.home.team.infoCommon.name}</h2>
			<select bind:value={homeSelected}>
				{#each periods.home as { periodName }, i}
					<option value={periodName}>{periodName}</option>
				{/each}
			</select>
			{#if edit}
				<div class="justify-self-center">
					<button class="inline-flex">
						<div class="mr-2">Add Periods</div>
						<svg
							class="h-4 w-4 self-center"
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"
							/>
						</svg>
					</button>
				</div>
			{/if}
		</div>
		<EditBoxScore {gameData} team={'home'} {edit} period={homeSelected} />
	</div>
	<div class="justify-self-center spacing p-3 md:p-6">
		<div class="flex inline-flex justify-between py-5 md:w-1/2 2xl:w-1/3">
			<h2 class="my-2">Visitor: {gameData.visitor.team.infoCommon.name}</h2>
			<select bind:value={visitorSelected}>
				{#each periods.visitor as p, i}
					<option value={p.periodName}>{p.periodName}</option>
				{/each}
			</select>
			{#if edit}
				<div class="justify-self-center">
					<button class="inline-flex">
						<div class="mr-2">Add Periods</div>
						<svg
							class="h-4 w-4 self-center"
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"
							/>
						</svg>
					</button>
				</div>
			{/if}
		</div>
		<EditBoxScore {gameData} team={'visitor'} {edit} period={visitorSelected} />
	</div>
</div>
