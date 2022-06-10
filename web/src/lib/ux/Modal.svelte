<script lang="ts">
	export let modalId: string;
	export let triggerTxt: string;
</script>

<label for={modalId} class="btn mx-2 modal-button">{triggerTxt}</label>
<!-- Put this part before </body> tag -->
<input type="checkbox" id={modalId} class="modal-toggle" />
<label for={modalId} class="modal modal-bottom sm:modal-middle cursor-pointer">
	<label class="modal-box relative" for="">
		<slot name="header">
			<!-- fallback -->
			<h3 class="text-lg font-bold">Your Modal Heading Goes Here...</h3>
		</slot>
		<slot name="content" />
	</label>
</label>
