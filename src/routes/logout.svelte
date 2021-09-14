<script context="module">
	export async function load({ fetch }) {
		await fetch('/api/auth/logout.json');
	}
</script>
