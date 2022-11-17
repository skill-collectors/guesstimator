<script>
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgHeadingTitle from "$lib/components/base/TgHeadingTitle.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
</script>

<div class="text-center">
  <TgHeadingMain>Welcome to</TgHeadingMain>
  <TgHeadingTitle>The Guesstimator</TgHeadingTitle>
  <TgParagraph>
    This is an app for "pointing" agile stories. To get started
  </TgParagraph>
  <TgButton id="createRoomButton" type="primary" href="/rooms" class="mt-4"
    >Create a room</TgButton
  >
</div>
