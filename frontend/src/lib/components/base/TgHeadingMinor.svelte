<script lang="ts">
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<h4 class={`font-bold font-sans mb-2 ${additionalClasses}`}><slot /></h4>
