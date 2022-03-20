<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { Player2Document } from '@balleranalytics/nba-api-ts';
	export const load: Load = async ({ fetch, params }) => {
		const url = `/players/${params.playerSlug}.json`;
		const res = await fetch(url);
		if (res.ok) {
			const { playerData: player }: { playerData: Player2Document } = await res.json();
			return {
				props: {
					player
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	import Twitter from '~icons/akar-icons/twitter-fill';
	import Insta from '~icons/akar-icons/instagram-fill';
	import Headshot from '$lib/ux/img/Headshot.svelte';
	import BioItem from '$lib/ux/players/profile/BioItem.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import dayjs from 'dayjs';
	export let player: Player2Document;
	// $: console.log(player);
</script>

<MetaTags
	title="{player.name.full}: Player Bio & Stats"
	description="{player.name
		.full}'s season and historical schedule, basic/advanced statistics, fantasy projections/historical data, and more."
/>

<div class="appContent min-h-screen flex flex-col w-full">
	<div class="mt-4 flex flex-col gap-6 sm:container mx-auto">
		<div class="text-black glassmorphicBg flex flex-wrap justify-center items-center">
			<div class="w-25 md:w-30 lg:w-35 xl:w-40 2xl:w-45">
				<Headshot
					avif={player.meta.images.headshot.avif}
					alt="{player.name.full} headshot"
					png={player.meta.images.headshot.png}
					webp={player.meta.images.headshot.webp}
				/>
			</div>
			<h1 class="text-dark-800 dark:text-light-200">{player.name.full}</h1>
		</div>

		<div
			class="flex flex-col gap-2 p-4 text-black glassmorphicBg flex flex-col justify-center text-center"
		>
			<h3 class="text-dark-800 dark:text-light-200">Socials</h3>
			<div class="flex inline-flex items-center justify-evenly">
				{#if player.socials.twitter}
					<a href="https://twitter.com/{player.socials.twitter}" target="_blank">
						<Twitter class="fill-dark-800 h-7 w-7 dark:fill-light-200" />
					</a>
				{/if}
				{#if player.socials.instagram}
					<a href="https://www.instagram.com/{player.socials.instagram}" target="_blank">
						<Insta class="fill-dark-800 h-7 w-7 dark:fill-light-200" />
					</a>
				{/if}
			</div>
		</div>
		<div
			class="flex flex-col gap-2 p-4 text-black glassmorphicBg flex flex-col justify-center text-center"
		>
			<h2 class="text-dark-800 dark:text-light-200">Player Bio</h2>
			<BioItem title={'full name'} data={player.name.full} />
			{#if player.name.pronunciation}
				<BioItem title={'pronunciation'} data={player.name.pronunciation} />
			{/if}
			{#if player.birthPlace.city && player.birthPlace.state}
				<BioItem
					title={'born'}
					data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${player.birthPlace.city}, ${
						player.birthPlace.state
					}`}
				/>
			{:else if player.birthPlace.city && player.birthPlace.country}
				<BioItem
					title={'born'}
					data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${player.birthPlace.city}, ${
						player.birthPlace.country
					}`}
				/>
			{:else if player.birthPlace.state && player.birthPlace.country}
				<BioItem
					title={'born'}
					data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${player.birthPlace.state}, ${
						player.birthPlace.country
					}`}
				/>
			{:else if player.birthPlace.country}
				<BioItem
					title={'born'}
					data={`${dayjs(player.birthDate).format('MMMM D, YYYY')} in ${player.birthPlace.country}`}
				/>
			{/if}
			<BioItem title={'height'} data={`${player.height.feet}' ${player.height.inches}"`} />
			<BioItem title={'weight'} data={`${player.weight} lbs`} />
			<BioItem title={'shoots'} data={player.shoots} />
			<BioItem title={'position'} data={player.position} />
			{#if player.college}
				<BioItem title={'college'} data={player.college} />
			{/if}
		</div>
	</div>
</div>
