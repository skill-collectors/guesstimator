<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="small-caps text-6xl">
	<span class="rainbow-text">{@render children?.()}</span>
</div>

<style>
	@keyframes rainbow-animation {
		0% {
			color: red;
		}
		14% {
			color: orange;
		}
		28% {
			color: yellow;
		}
		42% {
			color: green;
		}
		57% {
			color: blue;
		}
		71% {
			color: indigo;
		}
		85% {
			color: violet;
		}
		100% {
			color: red;
		}
	}

	.small-caps {
		font-variant: small-caps;
	}

	span.rainbow-text {
		animation: rainbow-animation 4s infinite;
	}
</style>
