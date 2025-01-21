<script lang="ts">
	interface Props {
		name?: string | null | undefined;
		value?: string;
		maxlength?: number | null | undefined;
		testId?: string | null | undefined;
		class?: string;
	}

	let {
		name = undefined,
		value = $bindable(''),
		maxlength = undefined,
		testId = undefined,
		class: additionalClasses = '',
	}: Props = $props();
</script>

<input
	type="text"
	{name}
	{maxlength}
	data-testid={testId}
	bind:value
	class={`rounded border border-gray-400 pl-1 ${additionalClasses}`}
/>
