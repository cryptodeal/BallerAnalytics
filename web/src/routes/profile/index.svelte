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
	export let user: UserDocument;
	let edit = false;
	//console.log(user);
</script>

<div class="appContent">
	<div class="container mx-auto p-5">
		<div class="md:flex no-wrap md:-mx-2">
			<!-- Left Side -->
			<div class="w-full md:(w-3/12 mx-2 my-auto)">
				<!-- Profile Card -->
				<div class="bg-white p-3 my-4 border-t-4 border-green-400">
					<div class="image overflow-hidden">
						<!--
              <img class="h-auto w-full mx-auto"
                  src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                  alt="">
            -->
					</div>
					<h1 class="text-gray-900 font-bold text-xl leading-8 my-1">Jane Doe</h1>
					<h3 class="text-gray-600 font-lg text-semibold leading-6">Owner at Her Company Inc.</h3>
					<p class="text-sm text-gray-500 hover:text-gray-600 leading-6">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, eligendi dolorum
						sequi illum qui unde aspernatur non deserunt
					</p>
					<ul
						class="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm"
					>
						<li class="flex items-center py-3">
							<span>Status</span>
							<span class="ml-auto"
								><span class="bg-green-500 py-1 px-2 rounded text-white text-sm">Active</span></span
							>
						</li>
						<li class="flex items-center py-3">
							<span>Member since</span>
							<span class="ml-auto">Nov 07, 2016</span>
						</li>
					</ul>
				</div>
				<!-- Team card -->
				<div class="bg-white p-3 hover:shadow my-4">
					<div class="flex items-center">
						<div
							class="flex-1 items-center inline-flex space-x-3 font-semibold text-gray-900 text-xl leading-8"
						>
							<span>My Teams</span>
						</div>
						<button
							class="bg-green-500 flex inline-flex items-center hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
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
							<a href="/teams/rockets" class="text-main-color">Houston Rockets</a>
						</div>
					</div>
				</div>
			</div>
			<!-- Right Side -->
			<div class="w-full md:(w-9/12 px-2) h-64 mb-4">
				<!-- Profile tab -->
				<!-- About Section -->
				<div class="bg-white p-3 shadow-sm rounded-sm my-4">
					<div class="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
						<div class="flex-1 inline-flex items-center">
							<IconPerson style="margin-right:.5rem;" />
							<span class="tracking-wide">About</span>
						</div>
						<button
							class="bg-green-500 flex inline-flex items-center hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
							on:click={() => (edit = !edit)}
						>
							<IconEdit />
							<div class="ml-2">Edit</div>
						</button>
					</div>
					<div class="text-gray-700">
						<div class="grid md:grid-cols-2 text-sm">
							<div class="grid grid-cols-2">
								{#if edit}
									<label class="px-2 md:px-4 py-2 font-semibold" for="name">First Name</label>
									<input
										class="input[type='text'] px-2 md:px-4 py-2"
										type="text"
										id="name"
										name="name"
									/>
								{:else}
									<div class="px-2 md:px-4 py-2 font-semibold">First Name</div>
									<div class="px-2 md:px-4 py-2">James</div>
								{/if}
							</div>
							<div class="grid grid-cols-2">
								<div class="px-2 md:px-4 py-2 font-semibold">Last Name</div>
								<div class="px-2 md:px-4 py-2">Deal</div>
							</div>
							<div class="grid grid-cols-2">
								<div class="px-2 md:px-4 py-2 font-semibold">Email</div>
								<div class="px-2 md:px-4 py-2">
									<a class="text-blue-800" href="mailto:{user.email}">{user.email}</a>
								</div>
							</div>
							<div class="grid grid-cols-2">
								<div class="px-2 md:px-4 py-2 font-semibold">Birthday</div>
								<div class="px-2 md:px-4 py-2">Feb 06, 1998</div>
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
				<div class="bg-white p-3 shadow-sm rounded-sm my-4">
					<div class="grid grid-cols-2">
						<div>
							<div
								class="flex inline-flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3"
							>
								<IconClipboard />
								<span class="tracking-wide">Experience</span>
							</div>
							<ul class="list-inside space-y-2">
								<li>
									<div class="text-teal-600">Owner at Her Company Inc.</div>
									<div class="text-gray-500 text-xs">March 2020 - Now</div>
								</li>
								<li>
									<div class="text-teal-600">Owner at Her Company Inc.</div>
									<div class="text-gray-500 text-xs">March 2020 - Now</div>
								</li>
								<li>
									<div class="text-teal-600">Owner at Her Company Inc.</div>
									<div class="text-gray-500 text-xs">March 2020 - Now</div>
								</li>
								<li>
									<div class="text-teal-600">Owner at Her Company Inc.</div>
									<div class="text-gray-500 text-xs">March 2020 - Now</div>
								</li>
							</ul>
						</div>
						<div>
							<div
								class="flex inline-flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3"
							>
								<IconGradHat />
								<span class="tracking-wide">Education</span>
							</div>
							<ul class="list-inside space-y-2">
								<li>
									<div class="text-teal-600">Masters Degree in Oxford</div>
									<div class="text-gray-500 text-xs">March 2020 - Now</div>
								</li>
								<li>
									<div class="text-teal-600">Bachelors Degreen in LPU</div>
									<div class="text-gray-500 text-xs">March 2020 - Now</div>
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
