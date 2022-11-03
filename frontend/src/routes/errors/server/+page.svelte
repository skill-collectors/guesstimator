<script lang="ts">
  // TODO read from querystring
  import { page } from "$app/stores";

  let errorId: string | null = $page.url.searchParams.get("errorId");
  let timestamp: string | null = $page.url.searchParams.get("timestamp");
</script>

<h1 class="h-main">
  The application was not able to complete the requested action
</h1>
<p>
  We could not complete the last operation due to a problem on our end. Please
  try again, or if the issue keeps happening you can
  <a
    class="link"
    href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
    >create a bug report.</a
  >
  {#if errorId}
    <p>If you create a bug report, please include the following details:</p>
    <ul class="list-disc">
      <li><strong>Error ID: </strong><span id="errorId">{errorId}</span></li>
      {#if timestamp}
        <li><strong>Timestamp: </strong>{timestamp}</li>
      {/if}
    </ul>
  {/if}
</p>
