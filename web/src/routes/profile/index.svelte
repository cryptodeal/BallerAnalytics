<script context="module" lang="ts">
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
	import type { UserDocument } from '@balleranalytics/nba-api-ts';
	import IconCirclePlus from '~icons/fluent/add-circle-24-regular';
	import IconEdit from '~icons/fluent/document-edit-24-regular';
	import IconPerson from '~icons/fluent/person-24-regular';
	import IconClipboard from '~icons/fluent/clipboard-text-ltr-24-regular';
	import IconGradHat from '~icons/fluent/hat-graduation-24-regular';
	import MultiStepForm from '$lib/ux/forms/MultiStepForm.svelte';
	export let user: UserDocument;
	let edit = false;
	//console.log(user);
</script>

{#if !user.name?.first || !user.name?.last || !user.birthdate}
	<MultiStepForm {user} />
{:else}
	<div class="appContent">
		<div class="container mx-auto p-5">
			<div class="md:flex no-wrap md:-mx-2">
				<!-- Left Side -->
				<div class="w-full md:(w-3/12 mx-2 my-auto)">
					<!-- Profile Card -->
					<div class="glassmorphicBg p-3 my-4 border-t-4 border-green-400">
						<div class="image overflow-hidden">
							<!--
              <img class="h-auto w-full mx-auto"
                  src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                  alt="">
            -->
						</div>
						<h1 class="font-bold text-xl leading-8 my-1">Jane Doe</h1>
						<h3 class="text-lg text-semibold leading-6">Owner at Her Company Inc.</h3>
						<p class="text-sm text-gray-700 leading-6 dark:text-gray-300">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, eligendi
							dolorum sequi illum qui unde aspernatur non deserunt
						</p>
						<ul class="glassmorphicBg hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
							<li class="flex items-center py-3">
								<span class="font-semibold">Status</span>
								<span class="ml-auto">
									<span class="bg-green-500 py-1 px-2 rounded text-white text-sm">Active</span>
								</span>
							</li>
							<li class="flex items-center py-3">
								<span class="font-semibold">Member since</span>
								<span class="ml-auto">Nov 07, 2016</span>
							</li>
						</ul>
					</div>
					<!-- Team card -->
					<div class="glassmorphicBg p-3 hover:shadow my-4">
						<div class="flex items-center">
							<div
								class="flex-1 items-center inline-flex space-x-3 font-semibold text-blue-600 text-xl leading-8"
							>
								<span>My Teams</span>
							</div>
							<button
								class="flex inline-flex items-center text-white font-bold py-1 px-2 rounded"
								on:click={() => (edit = !edit)}
							>
								<IconCirclePlus />

								<div class="ml-2">Add</div>
							</button>
						</div>
						<div class="grid grid-cols-3">
							<div class="text-center my-2">
								<img
									class="h-16 w-16 rounded-full mx-auto"
									src="https://logoeps.com/wp-content/uploads/2012/10/houston-rockets-logo-vector.png"
									alt=""
								/>
								<a href="/teams/rockets" class="text-gray-700 dark:text-gray-300">Houston Rockets</a
								>
							</div>
						</div>
					</div>
				</div>
				<!-- Right Side -->
				<div class="w-full md:(w-9/12 px-2) h-64 mb-4">
					<!-- Profile tab -->
					<!-- About Section -->
					<div class="glassmorphicBg p-3 shadow-sm rounded-sm my-4">
						<div class="flex items-center space-x-2 font-semibold leading-8">
							<div class="flex-1 inline-flex text-blue-600 items-center">
								<IconPerson class="mr-2 fill-current" />
								<span class="tracking-wide">About</span>
							</div>
							<button
								class="flex inline-flex items-center font-bold py-1 px-2 rounded"
								on:click={() => (edit = !edit)}
							>
								<IconEdit />
								<div class="ml-2">Edit</div>
							</button>
						</div>
						<div class="text-gray-700">
							<div class="grid text-sm md:(grid-cols-2 gap-4 gap-y-4)">
								<div class="grid grid-cols-2">
									{#if edit}
										<label class="text-blue-600 px-2 my-2 font-semibold md:px-4" for="firstName"
											>First Name</label
										>
										<input
											class="px-2 text-sm md:px-4"
											type="text"
											id="name"
											name="firstName"
											bind:value={user.name.first}
										/>
									{:else}
										<div class="text-blue-600 px-2 my-2 font-semibold md:px-4">First Name</div>
										<div class="px-2 my-2 text-gray-700 md:px-4 dark:text-gray-300">
											{user.name.first}
										</div>
									{/if}
								</div>
								<div class="grid grid-cols-2">
									{#if edit}
										<label class="text-blue-600 px-2 my-2 font-semibold md:px-4 " for="lastName"
											>Last Name</label
										>
										<input
											class="px-2 text-sm md:px-4"
											type="text"
											id="name"
											name="lastName"
											bind:value={user.name.last}
										/>
									{:else}
										<div class="text-blue-600 px-2 ny-2 font-semibold md:px-4 ">Last Name</div>
										<div class="px-2 my-2 text-gray-700 md:px-4 dark:text-gray-300">
											{user.name.last}
										</div>
									{/if}
								</div>
								<div class="grid grid-cols-2">
									{#if edit}
										<label class="text-blue-600 px-2 my-2 font-semibold md:px-4" for="email"
											>Email</label
										>
										<input
											class="px-2 text-sm md:px-4"
											type="text"
											id="email"
											name="email"
											bind:value={user.email}
										/>
									{:else}
										<div class="text-blue-600 px-2 my-2 font-semibold md:px-4 ">Email</div>
										<div class="px-2 my-2 text-gray-700 dark:text-gray-300 md:px-4">
											{user.email}
										</div>
									{/if}
								</div>

								<div class="grid grid-cols-2">
									{#if edit}
										<label class="text-blue-600 px-2 my-2 font-semibold md:px-4" for="birthday"
											>Birthday</label
										>
										<input
											class="px-2 text-sm md:px-4"
											type="text"
											id="birthday"
											name="birthday"
											bind:value={user.email}
										/>
									{:else}
										<div class="text-blue-600 px-2 my-2 font-semibold md:px-4 ">Email</div>
										<div class="px-2 my-2 text-gray-700 dark:text-gray-300 md:px-4">
											{user.birthdate}
										</div>
									{/if}
									<div class="text-blue-600 px-2 my-2 font-semibold md:px-4 ">Birthday</div>
									<div class="px-2 my-2 text-gray-700 md:px-4 dark:text-gray-300">
										{user.birthdate}
									</div>
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
								<div
									class="flex inline-flex items-center space-x-2 font-semibold text-blue-600 leading-8 mb-3"
								>
									<IconClipboard class="fill-current" />
									<span class="text-blue-600 tracking-wide">Experience</span>
								</div>
								<ul class="list-inside space-y-2">
									<li>
										<div class="text-blue-600">Owner at Her Company Inc.</div>
										<div class="text-gray-700 text-xs dark:text-gray-300">March 2020 - Now</div>
									</li>
									<li>
										<div class="text-blue-600">Owner at Her Company Inc.</div>
										<div class="text-gray-700 text-xs dark:text-gray-300">March 2020 - Now</div>
									</li>
									<li>
										<div class="text-blue-600">Owner at Her Company Inc.</div>
										<div class="text-gray-700 text-xs dark:text-gray-300">March 2020 - Now</div>
									</li>
									<li>
										<div class="text-blue-600">Owner at Her Company Inc.</div>
										<div class="text-gray-700 text-xs dark:text-gray-300">March 2020 - Now</div>
									</li>
								</ul>
							</div>
							<div>
								<div
									class="flex inline-flex items-center space-x-2 font-semibold text-blue-600 leading-8 mb-3"
								>
									<IconGradHat class="fill-current" />
									<span class="tracking-wide">Education</span>
								</div>
								<ul class="list-inside space-y-2">
									<li>
										<div class="text-blue-600">Masters Degree in Oxford</div>
										<div class="text-gray-700 text-xs dark:text-gray-300">March 2020 - Now</div>
									</li>
									<li>
										<div class="text-blue-600">Bachelors Degreen in LPU</div>
										<div class="text-gray-700 text-xs dark:text-gray-300">March 2020 - Now</div>
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
