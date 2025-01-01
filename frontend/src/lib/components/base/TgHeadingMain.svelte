<script lang="ts">
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: additionalClasses = '', children }: Props = $props();
</script>

<h2 class={`mb-2 font-sans text-2xl font-bold md:text-4xl ${additionalClasses}`}>
	{@render children?.()}
</h2>
