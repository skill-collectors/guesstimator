<script lang="ts">
  interface Props {
    href: string;
    target?: "_self" | "_blank" | "_parent" | "_top";
    class?: string;
    children?: import('svelte').Snippet;
  }

  let {
    href,
    target = "_self",
    class: additionalClasses = "",
    children
  }: Props = $props();
  
</script>

<a {href} {target} class={`text-blue-800 font-medium ${additionalClasses}`}
  >{@render children?.()}</a
>
