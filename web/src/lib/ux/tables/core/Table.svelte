<div
	class="my-2 flex flex-col w-full overflow-hidden glassmorphicCard text-dark-600 dark:text-light-200 md:(mx-auto)"
>
	<div class="py-2 -my-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
		<div
			class="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 dark:border-dark-100 shadow sm:rounded-lg"
		>
			<table class="min-w-full">
				<thead>
					<tr>
						<slot name="thead" />
					</tr>
				</thead>

				<tbody>
					<slot name="tbody" />
				</tbody>
			</table>
		</div>
	</div>
</div>
