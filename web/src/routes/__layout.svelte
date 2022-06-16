<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { afterNavigate } from '$app/navigation';
	import { themeChange } from 'theme-change';
	import '../app.css';
	import { page } from '$app/stores';
	import Notifications from 'svelte-notifications';
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
	import type { ObjectOption } from 'svelte-multiselect';
	const modalId = 'auth-modal',
		triggerTxt = 'login / register';
	$: segment = $page.url.pathname.split('/')[1];
	createTeamSubs();
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
		initialValues: { email: '', toc: false },
		validationSchema: yup.object().shape({
			email: yup.string().email().required(),
			toc: yup.bool().oneOf([true], 'Must accept the terms & conditions to register')
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
					success = true;
				} else {
					failed = true;
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

<Notifications>
	<div class="drawer">
		<input id="navDrawer" type="checkbox" class="drawer-toggle" bind:checked />
		<div
			bind:this={drawercontent}
			on:scroll={parseContentScroll}
			class="drawer-content flex flex-col"
			style="scroll-behavior: smooth; scroll-padding-top: 5rem;"
		>
			<Nav {segment} {modalId} {triggerTxt} {closeDrawer} />
			<div class="pt-6 px-2 sm:px-6 pb-10">
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
	<Modal modalId={'teamSubs'} onClick={() => null}>
		<svelte:fragment slot="content">
			<div class="w-full flex gap-2 flex-col items-center pb-12">
				<TeamSelect {teamSubs} />
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
						<div class="form-control">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label cursor-pointer gap-4">
								<span class="label-text">Email:</span>
								<Field class="form-field" id="email" name="email" type="email" />
							</label>
						</div>
						<ErrorMessage class="form-error" name="email" />
						<div class="form-control">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label cursor-pointer gap-4">
								<span class="label-text text-xs"
									>I have read & agree to the Terms & Conditions:</span
								>
								<Field class="checkbox checkbox-primary" id="toc" name="toc" type="checkbox" />
							</label>
						</div>
						<ErrorMessage class="form-error" name="toc" />
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
</Notifications>

<style lang="postcss">
	.ticker {
		width: 100vw;
		z-index: 30;
		overflow: hidden;
		position: fixed;
		bottom: 0;
	}
</style>
