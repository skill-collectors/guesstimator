<script lang="ts">
	interface Props {
		class: string;
		children?: import('svelte').Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<main class={className + ' m-2'}>
	{@render children?.()}
</main>
