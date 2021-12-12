<script>
	import 'virtual:windi.css';
	import '../app.css';
	import Nav from '$lib/nav/Nav.svelte';
	import Notifications from 'svelte-notifications';
</script>

<Notifications>
	<Nav />
	<body class="bg-gray-100">
		<slot />
	</body>
</Notifications>
