<script>
	export let tabs;
	let activeTab = 0;
	$: activeComponent = tabs[activeTab].component;
	//$: backpack = tabs[activeTab].backpack
</script>

<div class="binder">
	<div class="titles">
		{#each tabs as { name }, i}
			<span class={activeTab === i ? 'active' : ''} on:click={() => (activeTab = i)}>{name}</span>
		{/each}
	</div>
</div>
<flex-container>
	<div class="logo">
		<p>TEST!!!</p>
	</div>
	<!-- <svelte:component this={activeComponent} {backpack} /> -->
	<svelte:component this={activeComponent} />
</flex-container>

<style>
	span {
		padding: 20px;
		cursor: pointer;
		user-select: none;
	}
	span.active {
		border-bottom: 1px solid #d74e4d;
		cursor: auto;
	}
	.binder {
		margin-bottom: 3em;
	}
	.titles {
		text-align: center;
		height: auto;
	}
	.logo {
		width: 50%;
		align-content: center;
	}
	flex-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 0;
	}
</style>
