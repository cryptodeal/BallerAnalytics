<script lang="ts">
	import { onMount } from 'svelte';
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
	import TickerGame from '$lib/ux/Ticker/Game.svelte';
	const modalId = 'auth-modal',
		triggerTxt = 'login / register';
	$: segment = $page.url.pathname.split('/')[1];
	let success = false,
		failed = false;
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
					success = true;
				} else {
					failed = true;
				}
			});
		}
	};
	onMount(() => {
		themeChange(false);
	});
</script>

<Notifications>
	<div class="drawer">
		<input id="navDrawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content flex flex-col">
			<Nav {segment} {modalId} {triggerTxt} />
			<slot />
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
		<SideNav {segment} />
	</div>
	<input type="checkbox" id={modalId} class="modal-toggle" />
	<label for={modalId} class="modal modal-bottom sm:modal-middle cursor-pointer">
		<label class="modal-box relative" for="">
			<h3 class="text-lg font-bold text-center text-gray-400">Login / Register</h3>
			<div class="w-full flex flex-col justify-center p-1">
				<Form class="content" {...formProps}>
					<div class="m-1">
						<label class="block font-bold mt-[20px] mb-[4px] text-gray-400" for="email">email</label
						>
						<Field class="form-field" name="email" type="email" />
						<ErrorMessage class="form-error" name="email" />
					</div>
					<div class="flex flex-col mt-8 gap-2 justify-center">
						{#if failed}
							<span class="text-red-500 text-center">Something went wrong... Please try again.</span
							>
						{:else if success}
							<span class="text-green-500 text-center">Success; check your email!</span>
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
		overflow: hidden;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
	}
</style>
