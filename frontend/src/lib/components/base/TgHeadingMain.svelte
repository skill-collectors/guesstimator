<script lang="ts">
  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { class: additionalClasses = "", children }: Props = $props();
  
</script>

<h2
  class={`font-bold font-sans mb-2 text-2xl md:text-4xl ${additionalClasses}`}
>
  {@render children?.()}
</h2>
