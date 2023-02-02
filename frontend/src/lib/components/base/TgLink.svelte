<script lang="ts">
  export let href: string;
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<a {href} class={`text-blue-800 font-medium ${additionalClasses}`}><slot /></a>
