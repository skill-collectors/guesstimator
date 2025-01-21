<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="font-variant-small-caps text-6xl">
	<span class="animate-rainbow">{@render children?.()}</span>
</div>
