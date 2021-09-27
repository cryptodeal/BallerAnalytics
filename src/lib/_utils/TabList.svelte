<script>
	export let color;
</script>

<div class="tab-list" style="border-bottom-color:{color}">
	<slot />
</div>

<style>
	.tab-list {
		border-bottom-style: solid;
		border-bottom-width: 1px;
	}
</style>
