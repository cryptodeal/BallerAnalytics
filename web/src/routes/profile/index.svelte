<script context="module" lang="ts">
	export const logoModules = import.meta.globEager('../../lib/ux/teams/assets/logo-*.svelte');

	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ fetch, session }) => {
		if (!session.user) {
			return {
				redirect: '/',
				status: 302
			};
		}
		const url = `/profile.json?userId=${session.user.id}`;
		const res = await fetch(url);
		const { userData } = await res.json();

		//console.log(userData);
		return {
			props: {
				user: userData
			}
		};
	};
</script>

<script lang="ts">
	import dayjs from 'dayjs';
	import TeamSelect from '$lib/ux/forms/Subscriptions/TeamSelect.svelte';
	import IconCirclePlus from '~icons/fluent/add-circle-24-regular';
	import IconEdit from '~icons/fluent/document-edit-24-regular';
	import IconPerson from '~icons/fluent/person-24-regular';
	import IconClipboard from '~icons/fluent/clipboard-text-ltr-24-regular';
	import IconGradHat from '~icons/fluent/hat-graduation-24-regular';
	import MultiStepForm from '$lib/ux/forms/MultiStep/Template.svelte';
	import Modal from '$lib/ux/Modal.svelte';
	import type { PopulatedDocument, UserDocument } from '@balleranalytics/nba-api-ts';

	export let user: PopulatedDocument<UserDocument, 'subscriptions.teams'>;
	let edit = false;
	let dateString = dayjs(user.birthdate).format('YYYY-MM-DD');
	$: user.birthdate = new Date(dateString);
</script>

{#if !user.name?.first || !user.name?.last || !user.birthdate}
	<MultiStepForm {user} />
{:else}
	<div class="appContent">
		<div class="container mx-auto p-5">
			<div class="md:flex no-wrap md:-mx-2">
				<!-- Left Side -->
				<div class="w-full md:w-3/12 md:mx-2 md:my-auto">
					<!-- Profile Card -->
					<div class="glassmorphicBg p-3 my-4 border-t-4 border-primary">
						<div class="image overflow-hidden">
							<!--
              <img class="h-auto w-full mx-auto"
                  src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                  alt="">
            -->
						</div>
						<h1 class="font-bold text-xl leading-8 my-1">{user.name.first} {user.name.last}</h1>
						<!--
              <h3 class="text-lg text-semibold leading-6">Owner at Her Company Inc.</h3>
              <p class="text-sm text-gray-700 leading-6 dark:text-gray-300">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, eligendi
                dolorum sequi illum qui unde aspernatur non deserunt
              </p>
            -->
						<ul class="glassmorphicBg gap-4 p-4 rounded shadow-sm">
							<li class="flex items-center">
								<span class="font-semibold">Status</span>
								<div class="badge badge-lg badge-success ml-auto">
									<span class="text-sm">Active</span>
								</div>
							</li>
							<div class="divider" />
							<li class="flex items-center">
								<span class="font-semibold">Member since</span>
								<span class="ml-auto">{dayjs(user.createdAt).format('MMM DD, YYYY')}</span>
							</li>
						</ul>
					</div>
					<!-- Team card -->
					<div class="glassmorphicBg p-3 my-4">
						<div class="flex items-center">
							<div
								class="flex-1 items-center inline-flex space-x-3 font-semibold text-xl leading-8"
							>
								<span>My Teams</span>
							</div>
							<Modal modalId={'teamSubs'} onClick={() => null}>
								<svelte:fragment slot="trigger">
									<IconCirclePlus />
									Add Teams
								</svelte:fragment>
								<div slot="header">
									<h3 class="text-lg font-bold text-center">Select Teams</h3>
								</div>
								<div slot="content" class="w-full">
									<TeamSelect />
								</div>
							</Modal>
						</div>
						<div class="grid grid-cols-3">
							<div class="text-center my-2">
								{#each user.subscriptions.teams as team}
									<div>
										<img
											class="h-16 w-16 rounded-full mx-auto"
											src="teams/{team.infoCommon.slug}.svg"
											alt="{team.infoCommon.name} logo"
										/>
										{team.infoCommon.name}
									</div>
								{:else}
									<div class="text-center">No team subs...</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
				<!-- Right Side -->
				<div class="w-full md:w-9/12 md:px-2 h-64 mb-4">
					<!-- Profile tab -->
					<!-- About Section -->
					<div class="glassmorphicBg p-3 shadow-sm rounded-sm my-4">
						<div class="flex items-center space-x-2 font-semibold leading-8">
							<div class="flex-1 inline-flex items-center">
								<IconPerson class="mr-2 fill-current" />
								<span class="tracking-wide">About</span>
							</div>
							<button
								class="inline-flex items-center font-bold py-1 px-2 rounded"
								on:click={() => (edit = !edit)}
							>
								<IconEdit />
								<div class="ml-2">Edit</div>
							</button>
						</div>
						<div>
							<div class="grid text-sm md:grid-cols-2 md:gap-4 md:gap-y-4">
								<div class="grid grid-cols-2">
									{#if edit}
										<label class="px-2 my-2 font-semibold md:px-4" for="firstName">First Name</label
										>
										<input
											type="text"
											placeholder="First name..."
											id="firstName"
											name="firstName"
											class="input input-bordered input-primary w-full max-w-xs"
											bind:value={user.name.first}
										/>
									{:else}
										<div class="px-2 my-2 font-semibold md:px-4">First Name</div>
										<div class="px-2 my-2 md:px-4">
											{user.name.first}
										</div>
									{/if}
								</div>
								<div class="grid grid-cols-2">
									{#if edit}
										<label class="px-2 my-2 font-semibold md:px-4" for="lastName">Last Name</label>
										<input
											type="text"
											placeholder="Last name..."
											id="lastName"
											name="lastName"
											class="input input-bordered input-primary w-full max-w-xs"
											bind:value={user.name.last}
										/>
									{:else}
										<div class="px-2 my-2 font-semibold md:px-4">Last Name</div>
										<div class="px-2 my-2 md:px-4">
											{user.name.last}
										</div>
									{/if}
								</div>
								<div class="grid grid-cols-2">
									{#if edit}
										<label class="px-2 my-2 font-semibold md:px-4" for="email">Email</label>
										<input
											type="text"
											class="input input-bordered input-primary w-full max-w-xs"
											placeholder="Email..."
											id="email"
											name="email"
											bind:value={user.email}
										/>
									{:else}
										<div class="px-2 my-2 font-semibold md:px-4 ">Email</div>
										<div class="px-2 my-2 md:px-4">
											{user.email}
										</div>
									{/if}
								</div>

								<div class="grid grid-cols-2">
									{#if edit}
										<label class="px-2 my-2 font-semibold md:px-4" for="birthday">Birthday</label>
										<input
											type="date"
											class="input input-bordered input-primary w-full max-w-xs"
											id="birthday"
											name="birthday"
											bind:value={dateString}
										/>
									{:else}
										<div class="px-2 my-2 font-semibold md:px-4 ">Birthday</div>
										<div class="px-2 my-2 md:px-4">
											{dayjs(dateString).format('MMM DD, YYYY')}
										</div>
									{/if}
								</div>
							</div>
						</div>
						<!--
          <button
            class="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Show
            Full Information
          </button>
        -->
					</div>
					<!-- End of about section -->
					<!-- Experience and education -->
					<div class="glassmorphicBg p-3 shadow-sm rounded-sm my-4">
						<div class="grid grid-cols-2">
							<div>
								<div class="inline-flex items-center space-x-2 font-semibold leading-8 mb-3">
									<IconClipboard class="fill-current" />
									<span class="tracking-wide">Experience</span>
								</div>
								<ul class="list-inside space-y-2">
									<li>
										<div>Owner at Her Company Inc.</div>
										<div class="text-xs">March 2020 - Now</div>
									</li>
									<li>
										<div>Owner at Her Company Inc.</div>
										<div class="text-xs">March 2020 - Now</div>
									</li>
									<li>
										<div>Owner at Her Company Inc.</div>
										<div class="text-xs">March 2020 - Now</div>
									</li>
									<li>
										<div>Owner at Her Company Inc.</div>
										<div class="text-xs">March 2020 - Now</div>
									</li>
								</ul>
							</div>
							<div>
								<div class="inline-flex items-center space-x-2 font-semibold leading-8 mb-3">
									<IconGradHat class="fill-current" />
									<span class="tracking-wide">Education</span>
								</div>
								<ul class="list-inside space-y-2">
									<li>
										<div>Masters Degree in Oxford</div>
										<div class="text-xs">March 2020 - Now</div>
									</li>
									<li>
										<div>Bachelors Degreen in LPU</div>
										<div class="text-xs">March 2020 - Now</div>
									</li>
								</ul>
							</div>
						</div>
						<!-- End of Experience and education grid -->
					</div>
					<!-- End of profile tab -->
				</div>
			</div>
		</div>
	</div>
{/if}
