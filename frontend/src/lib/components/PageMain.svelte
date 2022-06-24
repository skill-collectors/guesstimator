<script type="ts">
  let className: string;
  export { className as class };
</script>

<main class={className + " m-2 font-serif"}>
  <slot />
</main>
