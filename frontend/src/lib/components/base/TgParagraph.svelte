<script type="ts">
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<p class={`mb-1 ${additionalClasses}`}><slot /></p>
