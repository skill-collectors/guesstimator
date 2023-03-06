<script>
  import TgLink from "./base/TgLink.svelte";

  const mode = import.meta.env.MODE;
</script>

<footer class="text-center p-3">
  <TgLink href="/">home</TgLink>
  |
  <TgLink href="https://github.com/skill-collectors/guesstimator">
    source code
  </TgLink>
  (AGPL) |
  <TgLink href="https://skill-collectors.github.io/guesstimator">
    dev docs
  </TgLink>
  {#if mode !== "production"}
    | {mode}
  {/if}
</footer>
