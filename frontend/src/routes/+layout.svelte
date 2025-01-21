<script lang="ts">
	import '../app.css';
	import PageMain from '$lib/components/PageMain.svelte';
	import PageFooter from '$lib/components/PageFooter.svelte';
	import { onMount } from 'svelte';
	import { redirectToErrorPage } from '$lib/services/errorHandler';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		window.onunhandledrejection = (e) => {
			const err = e.reason;
			redirectToErrorPage(err);
		};
	});
</script>

<div class="flex h-full flex-col text-center">
	<PageMain class="flex-grow">{@render children?.()}</PageMain>
	<PageFooter />
</div>

<style>
</style>
