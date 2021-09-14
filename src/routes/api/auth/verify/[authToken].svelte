<script context="module">
	export async function load({ fetch, page }) {
		const url = `/api/auth/verify/${page.params.authToken}.json`;

		const res = await fetch(url);

		if (res.ok) {
			await res.json();
			return {
				redirect: '/profile',
				status: 302
			};
		}
	}
</script>
