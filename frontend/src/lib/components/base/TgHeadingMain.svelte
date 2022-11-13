<script type="ts">
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<h2 class={`font-bold font-sans mb-2 text-4xl ${additionalClasses}`}>
  <slot />
</h2>
