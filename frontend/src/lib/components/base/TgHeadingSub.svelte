<script lang="ts">
  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { class: additionalClasses = "", children }: Props = $props();
  
</script>

<h3
  class={`font-bold font-sans mb-2 text-2xl text-slate-700 ${additionalClasses}`}
>
  {@render children?.()}
</h3>
