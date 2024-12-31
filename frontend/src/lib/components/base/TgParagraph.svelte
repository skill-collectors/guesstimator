<script lang="ts">
  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { class: additionalClasses = "", children }: Props = $props();
  
</script>

<p class={`mb-4 ${additionalClasses}`}>{@render children?.()}</p>
