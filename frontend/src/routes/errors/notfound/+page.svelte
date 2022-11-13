<script>
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgLink from "$lib/components/base/TgLink.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
</script>

<TgHeadingMain>Couldn't find the requested data</TgHeadingMain>
<TgParagraph>
  The application requested some data that couldn't be found. Please try again,
  or if the issue keeps happening you can
  <TgLink
    href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
    >create a bug report.
  </TgLink>
</TgParagraph>
