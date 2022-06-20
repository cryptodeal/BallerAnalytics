<script lang="ts">
	import dayjs from 'dayjs';
	import { capitalizeFirstLetter } from '$lib/functions/helpers';
	import { dailyGames } from '$lib/data/stores/games';
	import Table from '../core/Table.svelte';
	import THead from '../core/THead.svelte';
	import type {
		Game2Document,
		PopulatedDocument,
		Team2Document
	} from '@balleranalytics/nba-api-ts';
	import type { TeamRecord } from '$lib/types';
	import type { IColHeader } from '../types';
	import TFoot from '../core/TFoot.svelte';
	export let teamId: Team2Document['_id'];
	export let schedule: PopulatedDocument<
		PopulatedDocument<
			PopulatedDocument<PopulatedDocument<Game2Document, 'home.team'>, 'visitor.team'>,
			'home.players.player'
		>,
		'visitor.players.player'
	>[];
	// $: console.log($dailyGames);
	const colHeaders: IColHeader[] = [
		{ title: 'Date/Time (ET)' },
		{ title: 'Opponent' },
		{ title: 'Result' },
		{ title: 'W - L' }
	];

	const getRecord = (index: number): TeamRecord => {
		const record: TeamRecord = {
			wins: 0,
			losses: 0
		};
		for (let i = 0; i < index + 1; i++) {
			if (
				(teamId == schedule[i].home.team._id &&
					schedule[i].home.stats.totals.points > schedule[i].visitor.stats.totals.points) ||
				(teamId == schedule[i].visitor.team._id &&
					schedule[i].visitor.stats.totals.points > schedule[i].home.stats.totals.points)
			) {
				record.wins++;
			} else {
				record.losses++;
			}
		}
		return record;
	};
</script>

<Table>
	<THead slot="thead" {colHeaders} />
	<svelte:fragment slot="tbody">
		{#each schedule as { home, visitor, date, time, meta, _id }, i}
			<tr class="hover">
				<!-- Display Game Date and Time -->
				<th>
					<div class="text-sm font-bold leading-5">
						{#if time}
							{dayjs(date).format('ddd, MMM D @ h:mm A')}
						{:else}
							{dayjs(date).format('ddd, MMM D')}
						{/if}
					</div>
				</th>
				<!-- Display Opposing Team -->
				<td>
					<div class="inline-flex items-center whitespace-nowrap">
						{#if teamId == home.team._id}
							<div class="text-sm leading-5 mr-2">vs</div>
							<div class="flex flex-col w-auto justify-center">
								<div class="h-14 w-14">
									<img
										class="h-14 w-14"
										src="/teams/assets/logo-{visitor.team.infoCommon.slug}.svg"
										alt="{visitor.team.infoCommon.name}'s' logo"
									/>
								</div>
								<div class="text-sm text-center leading-5">
									{capitalizeFirstLetter(visitor.team.infoCommon.slug)}
								</div>
							</div>
						{:else}
							<div class="text-sm leading-5 mr-2">@</div>
							<div class="flex flex-col w-auto justify-center">
								<div class="h-14 w-14">
									<img
										class="h-14 w-14"
										src="/teams/assets/logo-{home.team.infoCommon.slug}.svg"
										alt="{home.team.infoCommon.name}'s' logo"
									/>
								</div>
								<div class="text-sm text-center leading-5">
									{capitalizeFirstLetter(home.team.infoCommon.slug)}
								</div>
							</div>
						{/if}
					</div>
				</td>
				{#if home.stats.totals?.points && visitor.stats.totals?.points}
					<td>
						<div class="text-sm leading-5 whitespace-nowrap inline-flex items-center text-wrap">
							{#if !$dailyGames || !$dailyGames[_id.toString()]}
								<div>
									{#if (teamId == home.team._id && home.stats.totals.points > visitor.stats.totals.points && meta.helpers.isOver) || (teamId == visitor.team._id && visitor.stats.totals.points > home.stats.totals.points && meta.helpers.isOver)}
										<div class="text-green-700 dark:text-green-500 font-bold mr-2">W</div>
									{:else if meta.helpers.isOver}
										<div class="text-red-700 dark:text-red-500 font-bold mr-2">L</div>
									{:else if !meta.helpers.isOver && home.stats.totals.points && visitor.stats.totals.points}
										<div class="text-red-600 font-bold animate-pulse text-sm mr-2">Live</div>
									{/if}
								</div>
							{:else}
								<div>
									{#if ($dailyGames && $dailyGames[_id.toString()] && teamId.toString() == $dailyGames[_id.toString()].home._id && $dailyGames[_id.toString()].home.score > $dailyGames[_id.toString()].visitor.score && $dailyGames[_id.toString()].isOver) || ($dailyGames && $dailyGames[_id.toString()] && teamId.toString() == $dailyGames[_id.toString()].visitor._id && $dailyGames[_id.toString()].visitor.score > $dailyGames[_id.toString()].home.score && $dailyGames[_id.toString()].isOver)}
										<div class="text-green-700 dark:text-green-500 font-bold mr-2">W</div>
									{:else if $dailyGames && $dailyGames[_id.toString()] && $dailyGames[_id.toString()].isOver}
										<div class="text-red-700 dark:text-red-500 font-bold mr-2">L</div>
									{:else if $dailyGames && $dailyGames[_id.toString()] && !$dailyGames[_id.toString()].isOver && $dailyGames[_id.toString()].home.score && $dailyGames[_id.toString()].visitor.score}
										<div
											class="text-red-600 dark:text-red-500 font-bold animate-pulse text-sm mr-2"
										>
											Live
										</div>
									{/if}
								</div>
							{/if}

							{#if $dailyGames && $dailyGames[_id.toString()]}
								<div class="inline-flex">
									{#if $dailyGames[_id.toString()].home.score === $dailyGames[_id.toString()].visitor.score}
										{$dailyGames[_id.toString()].home.score}&nbsp;-&nbsp;{$dailyGames[
											_id.toString()
										].visitor.score}
									{:else if teamId.toString() == $dailyGames[_id.toString()].home._id && $dailyGames[_id.toString()].home.score > $dailyGames[_id.toString()].visitor.score}
										<div class="text-green-700 dark:text-green-500 font-semibold">
											{$dailyGames[_id.toString()].home.score}
										</div>
										&nbsp;-&nbsp;{$dailyGames[_id.toString()].visitor.score}
									{:else if teamId.toString() == $dailyGames[_id.toString()].home._id}
										<div class="text-red-700 dark:text-red-500 font-semibold">
											{$dailyGames[_id.toString()].home.score}
										</div>
										&nbsp;-&nbsp;{$dailyGames[_id.toString()].visitor.score}
									{:else if teamId.toString() == $dailyGames[_id.toString()].visitor._id && $dailyGames[_id.toString()].visitor.score > $dailyGames[_id.toString()].home.score}
										{$dailyGames[_id.toString()].home.score}&nbsp;-&nbsp;
										<div class="text-green-700 dark:text-green-500 font-semibold">
											{$dailyGames[_id.toString()].visitor.score}
										</div>
									{:else}
										{$dailyGames[_id.toString()].home.score}&nbsp;-&nbsp;
										<div class="text-red-700 dark:text-red-500 font-semibold">
											{$dailyGames[_id.toString()].visitor.score}
										</div>
									{/if}
								</div>
							{:else}
								<div class="inline-flex">
									{#if home.stats.totals.points === visitor.stats.totals.points}
										{home.stats.totals.points}&nbsp;-&nbsp;{visitor.stats.totals.points}
									{:else if teamId == home.team._id && home.stats.totals.points > visitor.stats.totals.points}
										<div class="text-green-700 dark:text-green-500 font-semibold">
											{home.stats.totals.points}
										</div>
										&nbsp;-&nbsp;{visitor.stats.totals.points}
									{:else if teamId == home.team._id}
										<div class="text-red-700 dark:text-red-500 font-semibold">
											{home.stats.totals.points}
										</div>
										&nbsp;-&nbsp;{visitor.stats.totals.points}
									{:else if teamId == visitor.team._id && visitor.stats.totals.points > home.stats.totals.points}
										{home.stats.totals.points}&nbsp;-&nbsp;
										<div class="text-green-700 dark:text-green-500 font-semibold">
											{visitor.stats.totals.points}
										</div>
									{:else}
										{home.stats.totals.points}&nbsp;-&nbsp;
										<div class="text-red-700 dark:text-red-500 font-semibold">
											{visitor.stats.totals.points}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</td>
				{:else}
					<td>
						<div class="text-sm leading-5">--</div>
					</td>
				{/if}
				{#if meta.helpers.isOver}
					<td>
						{`${getRecord(i).wins} - ${getRecord(i).losses}`}
					</td>
				{:else}
					<td> -- </td>
				{/if}
			</tr>
		{/each}
	</svelte:fragment>
	<TFoot slot="tfoot" {colHeaders} />
</Table>
