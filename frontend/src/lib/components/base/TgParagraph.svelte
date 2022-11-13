<script type="ts">
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<p class={`mb-4 ${additionalClasses}`}><slot /></p>
