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
    dev docs |
  </TgLink>
  <TgLink
    href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
  >
    report a bug |
  </TgLink>
  <TgLink
    href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=enhancement&template=feature_request.md&title="
  >
    feature request
  </TgLink>
  {#if mode !== "production"}
    | {mode}
  {/if}
</footer>
