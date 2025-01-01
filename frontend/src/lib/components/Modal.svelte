<script lang="ts">
  import { run, self, createBubbler, stopPropagation } from 'svelte/legacy';

  const bubble = createBubbler();
  interface Props {
    showModal: boolean;
    children?: import('svelte').Snippet;
  }

  let { showModal = $bindable(), children }: Props = $props();

  let dialog = $state<HTMLDialogElement | undefined>(undefined);

  run(() => {
    if (dialog && showModal) dialog.showModal();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  class="bg-slate-100 text-slate-900 border-4 rounded-xl border-slate-600"
  onclose={() => (showModal = false)}
  onclick={self(() => dialog?.close())}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="p-4" onclick={stopPropagation(bubble('click'))}>
    {@render children?.()}
  </div>
</dialog>
