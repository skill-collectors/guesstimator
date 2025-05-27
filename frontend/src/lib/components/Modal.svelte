<script lang="ts">
	interface Props {
		showModal: boolean;
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let { showModal = $bindable(), children }: Props = $props();

	let dialog = $state<HTMLDialogElement | undefined>(undefined);

	$effect(() => {
		if (dialog && showModal) dialog.showModal();
	});
</script>

<dialog
	bind:this={dialog}
	class="mx-auto mt-30 rounded-xl border-4 border-slate-600 bg-slate-100 text-slate-900"
	onclose={() => (showModal = false)}
	onclick={(e) => {
		if (e.target === dialog) dialog?.close();
	}}
	onkeypress={(e) => {
		if (e.key === 'Escape') dialog?.close();
	}}
>
	<div class="p-4">
		{@render children?.()}
	</div>
</dialog>
