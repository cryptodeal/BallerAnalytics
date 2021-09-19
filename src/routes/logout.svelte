<script context="module">
	export async function load({ fetch }) {
		const url = `/api/auth/logout.json`;
		const res = await fetch(url);
		await res.json();
		if (res) {
			return {
				redirect: '/',
				status: 302
			};
		}
	}
</script>
