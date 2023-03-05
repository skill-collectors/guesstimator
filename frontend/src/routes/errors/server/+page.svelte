<script lang="ts">
  // TODO read from querystring
  import { page } from "$app/stores";
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgLink from "$lib/components/base/TgLink.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";

  let errorId: string | null = $page.url.searchParams.get("errorId");
  let timestamp: string | null = $page.url.searchParams.get("timestamp");
</script>

<svelte:head>
  <title>Guesstimator - Error</title>
  <meta name="description" content="Error page" />
</svelte:head>
<TgHeadingMain>
  The application was not able to complete the requested action
</TgHeadingMain>
<TgParagraph>
  We could not complete the last operation due to a problem on our end. Please
  try again, or if the issue keeps happening you can
  <TgLink
    href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
    >create a bug report.
  </TgLink>
</TgParagraph>
{#if errorId}
  <TgParagraph>
    If you create a bug report, please include the following details:
  </TgParagraph>
  <ul class="list-disc">
    <li><strong>Error ID: </strong><span id="errorId">{errorId}</span></li>
    {#if timestamp}
      <li><strong>Timestamp: </strong>{timestamp}</li>
    {/if}
  </ul>
{/if}
