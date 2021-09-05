<script>
	import Login from './authModal/Login.svelte';
	import Register from './authModal/Register.svelte';
	import Binder from './authModal/Binder.svelte';

	const tabs = [
		{ name: 'Login', component: Login },
		{ name: 'Register', component: Register }
	];
</script>

<Binder {tabs} />
