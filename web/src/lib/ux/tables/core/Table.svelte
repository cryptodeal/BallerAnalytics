<script lang="ts">
	export let compact = false;
</script>

<div class="overflow-x-auto w-full">
	<table class="table w-full" class:table-compact={compact}>
		<thead>
			<tr>
				<slot name="thead" />
			</tr>
		</thead>

		<tbody>
			<slot name="tbody" />
		</tbody>

		<!-- foot -->
		<tfoot>
			<tr>
				<slot name="tfoot" />
			</tr>
		</tfoot>
	</table>
</div>
