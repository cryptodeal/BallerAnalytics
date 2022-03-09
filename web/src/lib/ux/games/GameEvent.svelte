<script lang="ts">
	import TeamLogo from '$lib/ux/teams/assets/AnyTeamLogo.svelte';
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';
	import timezone from 'dayjs/plugin/timezone.js';
	import advancedFormat from 'dayjs/plugin/advancedFormat.js';
	import type { DailyGame } from '$lib/data/stores/types';
	import type { PopulatedDocument, Game2Document } from '@balleranalytics/nba-api-ts';
	import type { MetaGlobImport } from '$lib/types';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.extend(advancedFormat);
	dayjs.tz.setDefault('America/New_York');

	export let game: PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>;
	export let logoModules: MetaGlobImport;

	const estDate = dayjs(game.date).tz();
	const localTz = dayjs.tz.guess();
</script>

<div class="mx-auto rounded-lg glassmorphicBg h-25 my-6 sm:w-100">
	<div class="h-full w-full flex inline-flex items-center ">
		<div class="flex flex-wrap justify-center p-1 h-full w-1/4 ">
			<div
				class="h-6/10 w-full mb-1 rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
			>
				<TeamLogo slug={game.visitor.team.infoCommon.slug} {logoModules} />
			</div>
			<h6 class="h-4/10 text-dark-800 dark:text-light-200">
				{capitalizeFirstLetter(game.visitor.team.infoCommon.slug)}
			</h6>
		</div>
		<div
			class="flex flex-col items-center justify-center h-full w-1/2 text-center text-dark-800 dark:text-light-200"
		>
			<h5 class="text-dark-800 dark:text-light-200">@</h5>
			<h6 class="text-dark-800 dark:text-light-200">
				{estDate.minute() !== 0
					? estDate.tz(localTz).format('h:mm A z')
					: estDate.tz(localTz).format('h A z')}
			</h6>
		</div>
		<div class="flex flex-wrap justify-center p-1 h-full w-1/4">
			<div
				class="h-6/10 w-full mb-1 rounded-lg dark:(bg-white backdrop-filter backdrop-blur-sm bg-opacity-10)"
			>
				<TeamLogo slug={game.home.team.infoCommon.slug} {logoModules} />
			</div>
			<h6 class="h-4/10 text-dark-800 dark:text-light-200">
				{capitalizeFirstLetter(game.home.team.infoCommon.slug)}
			</h6>
		</div>
	</div>
</div>
