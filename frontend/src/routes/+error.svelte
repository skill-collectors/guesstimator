<script>
  import { page } from "$app/stores";
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  console.log(`${$page.status}: ${$page.error?.message}`);
</script>

{#if $page.status === 404}
  <TgHeadingMain>Page not found</TgHeadingMain>
  <p>
    There isn't a page here. Please double check the address bar, or if you got
    here by clicking a link you can
    <a
      class="link"
      href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
      >create a bug report.</a
    >
  </p>
{:else}
  <TgHeadingMain>
    The application was not able to complete the requested action
  </TgHeadingMain>
  <p>
    We could not complete the last operation due to a problem on our end. Please
    try again, or if the issue keeps happening you can
    <a
      class="link"
      href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
      >create a bug report.</a
    >
  </p>
{/if}
