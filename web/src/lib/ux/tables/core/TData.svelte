<script lang="ts">
	export let datum: string;
</script>

<td
	class="px-2 py-2 whitespace-nowrap border-b border-gray-200 dark:border-dark-100 md:px-4 xl:px-6"
>
	<slot>{datum}</slot>
</td>
