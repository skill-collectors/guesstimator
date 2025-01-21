<script lang="ts">
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: additionalClasses = '', children }: Props = $props();
</script>

<h3 class={`mb-2 font-sans text-2xl font-bold text-slate-700 ${additionalClasses}`}>
	{@render children?.()}
</h3>
