<script lang="ts">
  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { class: additionalClasses = "", children }: Props = $props();
  
</script>

<h1
  class={`font-bold font-sans mb-8 uppercase text-3xl md:text-6xl ${additionalClasses}`}
>
  {@render children?.()}
</h1>
