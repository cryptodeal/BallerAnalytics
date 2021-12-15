<script lang="ts">
	import 'virtual:windi.css';
	import Nav from '$lib/ux/nav/Nav.svelte';
	import Notifications from 'svelte-notifications';
</script>

<Notifications>
	<Nav />
	<body class="bg-gray-100">
		<slot />
	</body>
</Notifications>
