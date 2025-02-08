<script lang="ts">
	interface Props {
		type: 'primary' | 'secondary' | 'danger' | 'success';
		href?: string | undefined;
		id?: string | undefined;
		class?: string;
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		type,
		href = undefined,
		id = undefined,
		class: additionalClasses = '',
		children,
		onclick,
	}: Props = $props();
</script>

{#if href === undefined}
	{#if type === 'primary'}
		<button {id} class={`rounded-sm bg-blue-900 p-2 font-semibold text-blue-50 ${additionalClasses}`} {onclick}
			>{@render children?.()}</button
		>
	{/if}
	{#if type === 'secondary'}
		<button {id} class={`rounded-sm bg-slate-800 p-2 font-semibold text-slate-50 ${additionalClasses}`} {onclick}
			>{@render children?.()}</button
		>
	{/if}
	{#if type === 'danger'}
		<button {id} class={`rounded-sm bg-orange-800 p-2 font-semibold text-orange-50 ${additionalClasses}`} {onclick}
			>{@render children?.()}</button
		>
	{/if}
	{#if type === 'success'}
		<button {id} class={`rounded-sm bg-lime-800 p-2 font-semibold text-lime-50 ${additionalClasses}`} {onclick}
			>{@render children?.()}</button
		>
	{/if}
{:else}
	{#if type === 'primary'}
		<a {id} {href} class={`rounded-sm bg-blue-900 p-2 font-semibold text-blue-50 ${additionalClasses}`}
			>{@render children?.()}</a
		>
	{/if}
	{#if type === 'secondary'}
		<a {id} {href} class={`rounded-sm bg-slate-800 p-2 font-semibold text-slate-50 ${additionalClasses}`}
			>{@render children?.()}</a
		>
	{/if}
	{#if type === 'danger'}
		<a {id} {href} class={`rounded-sm bg-orange-800 p-2 font-semibold text-orange-50 ${additionalClasses}`}
			>{@render children?.()}</a
		>
	{/if}
	{#if type === 'success'}
		<a {id} {href} class={`rounded-sm bg-lime-800 p-2 font-semibold text-lime-50 ${additionalClasses}`}
			>{@render children?.()}</a
		>
	{/if}
{/if}
