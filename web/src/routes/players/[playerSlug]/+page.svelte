<script lang="ts">
	import Twitter from '$lib/ux/socials/Twitter.svelte';
	import Insta from '$lib/ux/socials/Instagram.svelte';
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import BioItem from '$lib/ux/players/profile/BioItem.svelte';
	import PlayerStats from '$lib/ux/tables/players/Stats.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import dayjs from 'dayjs';
import type { PageData } from './$types';
  export let data: PageData
  let {player} = data;
  $: ({player} = data); // so it stays in sync when `data` changes
	// $: console.log(player);
</script>

<MetaTags
	title="{player.name.full}: Player Bio & Stats"
	description="{player.name
		.full}'s season and historical schedule, basic/advanced statistics, fantasy projections/historical data, and more."
/>

<div class="flex flex-col w-full">
	<div class="mt-4 grid grid-cols-1 gap-10 sm:container sm:mx-auto sm:grid-cols-2">
		<div class="glassmorphicBg rounded-lg flex flex-wrap justify-center items-center sm:col-span-2">
			<div class="w-24 md:w-32 lg:w-36 xl:w-40 2xl:w-48">
				<Headshot
					avif={player.meta.images.headshot.avif}
					alt="{player.name.full} headshot"
					png={player.meta.images.headshot.png}
					webp={player.meta.images.headshot.webp}
				/>
			</div>
			<h1>{player.name.full}</h1>
		</div>

		<!--Player Bio-->
		<div class="p-4 rounded-lg glassmorphicBg flex flex-col gap-2 sm:m-auto justify-center">
			<h2 class="mb-6 text-center">Bio</h2>
			<div class="grid grid-cols-2 gap-2 px-4">
				<BioItem title={'full name'} data={player.name.full} />
				{#if player.name.pronunciation}
					<BioItem title={'pronunciation'} data={player.name.pronunciation} />
				{/if}
				{#if player.birthPlace.city && player.birthPlace.state}
					<BioItem
						title={'born'}
						data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${
							player.birthPlace.city
						}, ${player.birthPlace.state}`}
					/>
				{:else if player.birthPlace.city && player.birthPlace.country}
					<BioItem
						title={'born'}
						data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${
							player.birthPlace.city
						}, ${player.birthPlace.country}`}
					/>
				{:else if player.birthPlace.state && player.birthPlace.country}
					<BioItem
						title={'born'}
						data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${
							player.birthPlace.state
						}, ${player.birthPlace.country}`}
					/>
				{:else if player.birthPlace.country}
					<BioItem
						title={'born'}
						data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${
							player.birthPlace.country
						}`}
					/>
				{/if}
				<BioItem
					title={'height'}
					data={`${player.height.feet}' ${player.height.inches ? player.height.inches : 0}"`}
				/>
				<BioItem title={'weight'} data={`${player.weight} lbs`} />
				<BioItem title={'shoots'} data={player.shoots} />
				<BioItem title={'position'} data={player.position} />
				{#if player.college}
					<BioItem title={'college'} data={player.college} />
				{/if}
			</div>
		</div>
		{#if player.socials?.twitter || player.socials?.instagram}
			<div
				class="flex flex-col gap-1 py-10 px-10 rounded-lg glassmorphicBg sm:m-auto justify-center text-center"
			>
				<h3>Socials</h3>
				<div class="inline-flex items-center justify-evenly">
					{#if player.socials.twitter}
						<Twitter handle={player.socials.twitter} />
					{/if}
					{#if player.socials.instagram}
						<Insta handle={player.socials.instagram} />
					{/if}
				</div>
			</div>
		{/if}
		<div
			class="p-4 rounded-lg glassmorphicBg flex flex-col sm:container sm:mx-auto sm:col-span-2 justify-center"
		>
			<h2 class="mb-6 text-center">Career Stats:</h2>
			<PlayerStats {player} />
		</div>
	</div>
</div>
