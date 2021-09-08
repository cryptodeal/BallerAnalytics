<script context="module">
	export async function load({ session }) {
		return {
			props: {
				user: session
			}
		};
	}
</script>

<script>
	export let user;
</script>

<h1>Welcome, {user.email}!</h1>
