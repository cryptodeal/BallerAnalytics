<script lang="ts">
	export let modalId: string;
	export let onClick: () => void;
</script>

<label for={modalId} class="btn gap-2 modal-button">
	<slot name="trigger">default trigger</slot>
</label>
<!-- Put this part before </body> tag -->
<input type="checkbox" id={modalId} class="modal-toggle" on:click={onClick} />
<label for={modalId} class="modal modal-middle cursor-pointer">
	<label class="modal-box relative" for="">
		<slot name="header">
			<!-- fallback -->
			<h3 class="text-lg font-bold">Your Modal Heading Goes Here...</h3>
		</slot>
		<slot name="content" />
	</label>
</label>
