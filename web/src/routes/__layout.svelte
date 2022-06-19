<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { themeChange } from 'theme-change';
	import '../app.css';
	import { page } from '$app/stores';
	import { getNotificationsStore } from '$lib/data/stores/notifications';
	import { Form, Field, ErrorMessage } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import Nav from '$lib/ux/nav/Navbar.svelte';
	import SideNav from '$lib/ux/nav/SideNav.svelte';
	import { dailyGames } from '$lib/data/stores/games';
	import Ticker from '$lib/ux/Ticker/Ticker.svelte';
	import TeamSelect from '$lib/ux/forms/Subscriptions/TeamSelect.svelte';
	import TickerGame from '$lib/ux/Ticker/Game.svelte';
	import Modal from '$lib/ux/Modal.svelte';
	import { createTeamSubs, getTeamSubs } from '$lib/data/stores/teamSubs';
	import Toast from '$lib/ux/Toast.svelte';
	const modalId = 'auth-modal',
		triggerTxt = 'login / register';
	$: segment = $page.url.pathname.split('/')[1];
	createTeamSubs();
	const notifications = getNotificationsStore();
	let success = false,
		failed = false,
		drawercontent,
		drawerContentScrollY = 0,
		drawersidebar,
		drawerSidebarScrollY = 0,
		checked: boolean = '' as unknown as boolean,
		teamSubs = getTeamSubs();

	function parseContentScroll() {
		drawerContentScrollY = drawercontent.scrollTop;
	}

	function parseSidebarScroll() {
		drawerSidebarScrollY = drawersidebar.scrollTop;
	}

	function closeDrawer() {
		checked = '' as unknown as boolean;
	}

	onMount(() => {
		themeChange(false);
		parseContentScroll();
		parseSidebarScroll();
	});

	afterNavigate(() => {
		drawercontent.scrollTop = 0;
	});

	const formProps = {
		initialValues: { email: '' },
		validationSchema: yup.object().shape({
			email: yup.string().email().required()
		}),
		onSubmit: (values) => {
			fetch('/api/auth.json', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(values)
			}).then((res) => {
				if (res.status === 200) {
					notifications.success('Success; check your email!');
				} else {
					notifications.error('Error... Please try again!');
				}
			});
		}
	};
</script>

<svelte:head>
	<script>
		(function () {
			/* return if SSR */
			if (typeof document === 'undefined') return;
			const theme = localStorage.getItem('theme');
			if (
				theme === 'night' ||
				(!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
			) {
				document.documentElement.setAttribute('data-theme', 'night');
				localStorage.setItem('theme', 'night');
			} else {
				document.documentElement.setAttribute('data-theme', 'corporate');
				localStorage.setItem('theme', 'corporate');
			}
		})();
	</script>
</svelte:head>

<div class="drawer">
	<input id="navDrawer" type="checkbox" class="drawer-toggle" bind:checked />
	<div
		bind:this={drawercontent}
		on:scroll={parseContentScroll}
		class="drawer-content flex flex-col"
		style="scroll-behavior: smooth; scroll-padding-top: 5rem;"
	>
		<Nav {segment} {modalId} {triggerTxt} {closeDrawer} />
		<div class="pt-6 px-2 pb-10 md:px-6">
			<slot />
		</div>
		{#if Object.values($dailyGames).length}
			<div class="ticker bg-gray-300/20 backdrop-filter backdrop-blur-sm dark:bg-gray-900/20">
				<Ticker>
					{#each Object.values($dailyGames).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as game}
						<TickerGame {game} />
					{/each}
				</Ticker>
			</div>
		{/if}
	</div>
	<div
		class="drawer-side"
		style="scroll-behavior: smooth; scroll-padding-top: 5rem;"
		bind:this={drawersidebar}
		on:scroll={parseSidebarScroll}
	>
		<label for="navDrawer" class="drawer-overlay" />
		<aside class="bg-base-200 w-80">
			<SideNav {closeDrawer} {segment} />
			<div
				class="from-base-200 pointer-events-none sticky bottom-0 flex h-20 bg-gradient-to-t to-transparent"
			/>
		</aside>
	</div>
</div>
<Toast />

<Modal modalId={'teamSubs'} onClick={() => null}>
	<svelte:fragment slot="content">
		<div class="w-full flex gap-2 flex-col items-center pb-12">
			<TeamSelect {teamSubs} saveBtn={true} />
		</div>
	</svelte:fragment>
</Modal>
<input type="checkbox" id={modalId} class="modal-toggle" />
<label for={modalId} class="modal modal-bottom sm:modal-middle cursor-pointer">
	<label class="modal-box relative" for="">
		<h3 class="text-lg font-bold text-center py-4">Login / Register</h3>
		<div class="flex flex-col gap-4 items-center p-1">
			<Form class="content" {...formProps}>
				<div class="flex flex-col gap-4 items-center">
					<div class="form-control w-full max-w-xs">
						<label for="email" class="label cursor-pointer gap-4">
							<span class="label-text">Email:</span>
						</label>
						<Field class="form-field" id="email" name="email" type="email" />
					</div>
					<ErrorMessage class="form-error" name="email" />
					{#if failed}
						<span class="text-error text-center text-sm"> Error... Please try again. </span>
					{:else if success}
						<span class="text-success text-center text-sm"> Success; check your email! </span>
					{/if}
					<button class="btn" type="submit">submit</button>
				</div>
			</Form>
		</div>
	</label>
</label>

<style lang="postcss">
	.ticker {
		width: 100vw;
		z-index: 30;
		overflow: hidden;
		position: fixed;
		bottom: 0;
	}
</style>
