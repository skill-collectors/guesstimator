<script>
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
</script>

<TgHeadingMain>Couldn't find that room</TgHeadingMain>
<TgParagraph>
  The room you tried to go to doesn't exist. The URL may be incorrect, or the
  room may have been deleted if it hasn't been used in a while. You can always <a
    class="link"
    href="/rooms">create a new room.</a
  >
  If you're sure the room should exist, you can also
  <a
    class="link"
    href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
    >create a bug report.</a
  >
</TgParagraph>
