<script context="module">
	export async function load({ session }) {
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script>
	//export let user;
	let edit = false;
	//console.log(user);
</script>

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
				<div class="flex items-center space-x-3 font-semibold text-gray-900 text-xl leading-8">
					<span>My Teams</span>
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
					<div class="flex-1 inline-flex">
						<svg
							class="h-5 self-center text-green-500"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
						<span class="tracking-wide">About</span>
					</div>
					<button
						class="bg-green-500 inline-flex hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
						on:click={() => (edit = !edit)}
					>
						<svg
							class="h-4 self-center"
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								d="M18.363 8.464l1.433 1.431-12.67 12.669-7.125 1.436 1.439-7.127 12.665-12.668 1.431 1.431-12.255 12.224-.726 3.584 3.584-.723 12.224-12.257zm-.056-8.464l-2.815 2.817 5.691 5.692 2.817-2.821-5.693-5.688zm-12.318 18.718l11.313-11.316-.705-.707-11.313 11.314.705.709z"
							/>
						</svg>
						<div class="ml-2">Edit</div>
					</button>
				</div>
				<div class="text-gray-700">
					<div class="grid md:grid-cols-2 text-sm">
						<div class="grid grid-cols-2">
							{#if edit}
								<label class="px-2 md:px-4 py-2 font-semibold" for="name">First Name</label>
								<input class="px-2 md:px-4" type="text" id="name" name="name" />
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
								<a class="text-blue-800" href="mailto:jimmydeal@gmail.com">jimmydeal@gmail.com</a>
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
						<div class="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3">
							<span clas="text-green-500">
								<svg
									class="h-5"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</span>
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
						<div class="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3">
							<span clas="text-green-500">
								<svg
									class="h-5"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path fill="#fff" d="M12 14l9-5-9-5-9 5 9 5z" />
									<path
										fill="#fff"
										d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
									/>
								</svg>
							</span>
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
