<script>
	import 'virtual:windi.css';
	import Nav from '$lib/nav/Nav.svelte';
	import Notifications from 'svelte-notifications';
</script>

<Notifications>
	<Nav />
	<slot />
</Notifications>
