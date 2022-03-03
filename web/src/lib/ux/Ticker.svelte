<script lang="ts">
	import { getMainColor } from 'nba-color';
	import { dailyGames } from '$lib/data/stores/games';
	import dayjs from 'dayjs';
</script>

<div class="ticker-wrap">
	<div class="ticker">
		{#each Object.values($dailyGames) as { date, isOver, period, periodValue, displayClock, clock, home, visitor }}
			<div class="ticker__item bg-gray-200 bg-opacity-30 mr-50">
				<div
					class="inline-block h-full text-3xl px-2 font-semibold"
					style="background-color:{getMainColor(visitor.infoCommon.nbaAbbreviation)
						.hex};opacity:100%;"
				>
					{visitor.infoCommon.nbaAbbreviation}
				</div>
				{#if visitor.score && visitor.score !== null}
					<div class="inline-block h-full px-2 bg-red-600 text-3xl font-semibold">
						{visitor.score}
					</div>
				{/if}

				<div class="inline-block text-3xl font-semibold">&nbsp;@&nbsp;</div>
				<div
					class="inline-block h-full text-3xl px-2 font-semibold"
					style="background-color:{getMainColor(home.infoCommon.nbaAbbreviation).hex};opacity:100%;"
				>
					{home.infoCommon.nbaAbbreviation}
				</div>
				{#if home.score && home.score !== null}
					<div class="inline-block h-full bg-red-600 px-2 text-3xl font-semibold">
						{home.score}
					</div>
				{/if}

				{#if home.score == null && visitor.score == null}
					<div class="inline-block h-full px-2 text-3xl font-semibold">
						{dayjs(date).minute() !== 0
							? dayjs(date).format('h:mm A') + 'ET'
							: dayjs(date).format('h A') + 'ET'}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	@-webkit-keyframes ticker {
		0% {
			-webkit-transform: translate3d(0, 0, 0);
			transform: translate3d(0, 0, 0);
			visibility: visible;
		}
		100% {
			-webkit-transform: translate3d(-100%, 0, 0);
			transform: translate3d(-100%, 0, 0);
		}
	}

	@keyframes ticker {
		0% {
			-webkit-transform: translate3d(0, 0, 0);
			transform: translate3d(0, 0, 0);
			visibility: visible;
		}
		100% {
			-webkit-transform: translate3d(-100%, 0, 0);
			transform: translate3d(-100%, 0, 0);
		}
	}

	.ticker-wrap {
		position: fixed;
		bottom: 0;
		width: 100%;
		overflow: hidden;
		height: 2.25rem;
		background-color: rgba(0, 0, 0, 0.3);
		padding-left: 100%;
		box-sizing: content-box;
	}

	.ticker-wrap .ticker {
		display: inline-block;
		height: 2.25rem;
		line-height: 2.25rem;
		white-space: nowrap;
		padding-right: 100%;
		box-sizing: content-box;
		-webkit-animation-iteration-count: infinite;
		animation-iteration-count: infinite;
		-webkit-animation-timing-function: linear;
		animation-timing-function: linear;
		-webkit-animation-name: ticker;
		animation-name: ticker;
		-webkit-animation-duration: 45s;
		animation-duration: 45s;
	}

	.ticker-wrap .ticker__item {
		display: inline-block;
		padding: 0 2rem;
		font-size: 2rem;
		color: white;
	}
</style>
