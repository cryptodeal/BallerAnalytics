<script lang="ts">
	import dayjs from 'dayjs';
	import { teams } from '$lib/data/teams';
	import { getTeamSubs } from '$lib/data/stores/teamSubs';
	import { getNotificationsStore } from '$lib/data/stores/notifications';
	import IconCirclePlus from '~icons/fluent/add-circle-24-regular';
	import IconEdit from '~icons/fluent/document-edit-24-regular';
	import IconPerson from '~icons/fluent/person-24-regular';
	import IconClipboard from '~icons/fluent/clipboard-text-ltr-24-regular';
	import IconGradHat from '~icons/fluent/hat-graduation-24-regular';
	import MultiStepForm from '$lib/ux/forms/MultiStep/Template.svelte';
	// import type { PopulatedDocument, UserDocument } from '@balleranalytics/nba-api-ts';
	import type { ObjectOption } from 'svelte-multiselect';
	import type { PageData } from './$types';
	export let data: PageData;
	let { user } = data;
	$: ({ user } = data); // so it stays in sync when `data` changes
	$: console.log(user);
	const teamSubs = getTeamSubs(),
		notifications = getNotificationsStore(),
		saveUserData = () => {
			edit = !edit;
			const postData = {
				type: 'Update',
				name: {
					first: user.name.first,
					last: user.name.last
				},
				teamSubs: $teamSubs.map((t) => t.value)
			};
			return fetch('/profile.json', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
			}).then((res) => {
				if (res.status === 200) {
					notifications.success('Successfully updated your user data!');
				} else {
					notifications.error('Error; failed to update your user data!');
				}
			});
		};
	if (user.subscriptions.teams.length) {
		const teamSubSelect: ObjectOption[] = [];
		user.subscriptions.teams.map((t) => {
			const teamOption = teams[teams.findIndex((t2) => t2.id === t._id.toString())];
			teamSubSelect.push({ value: teamOption.id, label: teamOption.name });
		});
		teamSubs.set(teamSubSelect);
	}
	let edit = false;
	let dateString = new Date(user.birthdate as Date);
	$: user.birthdate = new Date(dateString);
	$: sortedTeamSubs = $teamSubs.slice().sort((a, b) => (a.label > b.label ? 1 : -1));
</script>

{#if !user.name?.first || !user.name?.last || !user.birthdate}
	<MultiStepForm {user} />
{:else}
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
						<div class="flex-1 items-center inline-flex space-x-3 font-semibold text-xl leading-8">
							<span>My Teams</span>
						</div>
						<label for="teamSubs" class="btn btn-sm gap-2 modal-button">
							<IconCirclePlus />
							Add Teams
						</label>
					</div>
					<div class="p-2 grid grid-cols-4">
						{#each sortedTeamSubs as { value }}
							{@const { name, abbrev, slug } = teams[teams.findIndex((t) => t.id === value)]}
							{@const src = `/assets/teams/logo-${slug}.svg`}
							<div class="flex flex-col gap-1 items-center text-sm">
								<img
									class="h-10 w-10 md:h-12 md:w-12 2xl:w-16 2xl:h-16"
									{src}
									alt="{name}'s' logo"
								/>
								<span class="font-bold">{abbrev}</span>
							</div>
						{:else}
							<div class="text-center">No team subs...</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Side -->
			<div class="w-full md:w-9/12 md:px-2 h-64 mb-4">
				<!-- Profile tab -->
				<!-- About Section -->
				<div class="glassmorphicBg p-3 shadow-sm rounded-sm my-4">
					<div class="flex my-2 gap-4 items-center font-semibold leading-8">
						<div class="flex-1 inline-flex items-center">
							<IconPerson class="mr-2 fill-current" />
							<span class="tracking-wide">About</span>
						</div>
						<div class="btn-group">
							{#if edit}
								<button class="btn btn-sm btn-primary" on:click={saveUserData}>Save</button>
							{/if}
							<button class="btn btn-sm gap-2" on:click={() => (edit = !edit)}>
								<IconEdit />
								<span>Edit</span>
							</button>
						</div>
					</div>
					<div class="grid text-sm md:grid-cols-2 md:gap-4 md:gap-y-4">
						{#if edit}
							<div class="form-control w-full max-w-xs">
								<label for="firstName" class="label">
									<span class="label-text">First Name</span>
								</label>
								<input
									type="text"
									placeholder="First name..."
									id="firstName"
									name="firstName"
									class="form-field"
									bind:value={user.name.first}
								/>
							</div>
							<div class="form-control w-full max-w-xs">
								<label for="lastName" class="label">
									<span class="label-text">Last Name</span>
								</label>
								<input
									type="text"
									placeholder="Last name..."
									id="lastName"
									name="lastName"
									class="form-field"
									bind:value={user.name.last}
								/>
							</div>

							<div class="form-control w-full max-w-xs">
								<label for="email" class="label">
									<span class="label-text">Email</span>
								</label>
								<input
									type="text"
									class="form-field"
									placeholder="Email..."
									id="email"
									name="email"
									bind:value={user.email}
								/>
							</div>
						{:else}
							<div class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">First Name</span>
								</div>
								<div
									class="inline-flex flex-shrink items-center justify-start h-12 px-8 pl-4 w-full max-w-xs"
								>
									{user.name.first}
								</div>
							</div>

							<div class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Last Name</span>
								</div>
								<div
									class="inline-flex flex-shrink justify-start items-center h-12 px-8 pl-4 w-full max-w-xs"
								>
									{user.name.last}
								</div>
							</div>

							<div class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Email</span>
								</div>
								<div
									class="inline-flex flex-shrink items-center justify-start h-12 px-8 pl-4 w-full max-w-xs"
								>
									{user.email}
								</div>
							</div>
						{/if}
						<div class="form-control w-full max-w-xs">
							<div class="label">
								<span class="label-text">Date of Birth</span>
							</div>
							<div
								class="inline-flex flex-shrink items-center justify-start h-12 px-8 pl-4 w-full max-w-xs"
							>
								{dayjs(dateString).format('MMM DD, YYYY')}
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
{/if}
