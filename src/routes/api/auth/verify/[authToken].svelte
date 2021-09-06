<script context="module">
	export async function load({ page, fetch }) {
		const url = `/api/auth/verify/${page.params.authToken}.json`;

		const res = await fetch(url);

		if (res) {
			const result = await res.json();
			return {
				props: {
					result
				}
			};
		}
	}
</script>

<script>
	export let result;
	console.log(result);
</script>

<h1>Congrats; Login Successful!</h1>
<h3>Please return to your original tab and reload page</h3>
