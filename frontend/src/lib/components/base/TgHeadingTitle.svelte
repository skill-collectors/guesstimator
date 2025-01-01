<script lang="ts">
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: additionalClasses = '', children }: Props = $props();
</script>

<h1 class={`mb-8 font-sans text-3xl font-bold uppercase md:text-6xl ${additionalClasses}`}>
	{@render children?.()}
</h1>
