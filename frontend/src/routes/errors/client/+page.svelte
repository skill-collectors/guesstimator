<script>
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgLink from "$lib/components/base/TgLink.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
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
