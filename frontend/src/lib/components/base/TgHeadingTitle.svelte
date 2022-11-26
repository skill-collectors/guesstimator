<script type="ts">
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<h1
  class={`font-bold font-sans mb-8 uppercase text-3xl md:text-6xl ${additionalClasses}`}
>
  <slot />
</h1>
