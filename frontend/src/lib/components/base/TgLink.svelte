<script lang="ts">
  export let href: string;
  export let target: "_self" | "_blank" | "_parent" | "_top" = "_self";
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<a {href} {target} class={`text-blue-800 font-medium ${additionalClasses}`}
  ><slot /></a
>
