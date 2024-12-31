<script lang="ts">
  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { class: additionalClasses = "", children }: Props = $props();
  
</script>

<h4 class={`font-bold font-sans mb-2 ${additionalClasses}`}>{@render children?.()}</h4>
