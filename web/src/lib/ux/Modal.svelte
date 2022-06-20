<script lang="ts">
	export let modalId: string;
	export let onClick: () => void;
</script>

<!-- Put this part before </body> tag -->
<label for={modalId}>
	<input type="checkbox" id={modalId} class="modal-toggle" on:click={onClick} />
</label>
<label for={modalId} class="modal cursor-pointer">
	<label class="modal-box relative" for="">
		<slot name="header" />
		<slot name="content" />
	</label>
</label>
