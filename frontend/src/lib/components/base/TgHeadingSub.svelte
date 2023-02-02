<script lang="ts">
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<h3
  class={`font-bold font-sans mb-2 text-2xl text-slate-700 ${additionalClasses}`}
>
  <slot />
</h3>
