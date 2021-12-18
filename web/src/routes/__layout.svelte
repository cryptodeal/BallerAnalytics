<script lang="ts">
	import 'virtual:windi.css';
	import './app.css';
	import Nav from '$lib/ux/nav/Nav.svelte';
	import Notifications from 'svelte-notifications';
</script>

<div class="h-100vh w-100vw">
	<Notifications>
		<Nav />
		<div class="h-full w-full overflow-auto">
			<slot />
		</div>
	</Notifications>
</div>
