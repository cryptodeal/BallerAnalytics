<script>
	export let player;
	export let matches;
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	let matchIndex;
	$: selected = matches[matchIndex];
	let id;

	function saveMatch() {
		return fetch('/admin/linkPlayers.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				nbaId: id,
				id: player._id
			})
		})
			.then(async (res) => {
				//console.log(res)
				if (res.status === 200 && res.ok) {
					const { data } = await res.json();
					addNotification({
						text: `Success: Updated ${data.name.full}`,
						position: 'top-right',
						type: 'success',
						removeAfter: 4000
					});
					return data;
				} else {
					const { error } = await res.json();
					addNotification({
						text: `ERROR: ${error}`,
						position: 'top-right',
						type: 'danger',
						removeAfter: 4000
					});
					return error;
				}
			})
			.then((d) => {
				console.log(d.name.full);
			});
	}
</script>

<div class="bg-blue-700 rounded-sm hover:bg-opacity-30 bg-opacity-10 my-2 p-2">
	<div class="flex inline-flex w-full items-center content-center justify-between">
		<h2>{player.name.full}</h2>
		<a
			href="https://www.basketball-reference.com/players/{player.meta.helpers.bballRef.playerUrl.slice(
				0,
				1
			)}/{player.meta.helpers.bballRef.playerUrl}.html"
			target="_blank">{player.meta.helpers.bballRef.playerUrl}</a
		>
		<!--
    <select bind:value={matchIndex}>
      {#each matches as player, i}
        {#if player.name.fullName}
          <option value={i}>{player.name.fullName}, {player._id}</option>
        {:else}
          <option value={i}>{player.name.first} {player.name.last}, {player._id}</option>
        {/if}
      {/each}	
    </select>
    -->
		<input type="text" bind:value={id} />
		<button class="bg-green-500 hover:bg-green-400" on:click={saveMatch}>Update</button>
	</div>
</div>
