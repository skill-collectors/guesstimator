<script lang="ts">
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: additionalClasses = '', children }: Props = $props();
</script>

<h4 class={`mb-2 font-sans font-bold ${additionalClasses}`}>{@render children?.()}</h4>
