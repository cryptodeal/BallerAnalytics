<div class="overflow-x-auto w-full">
	<table class="table w-full">
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
