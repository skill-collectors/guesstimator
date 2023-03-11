<script>
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgHeadingTitle from "$lib/components/base/TgHeadingTitle.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import TgLink from "$lib/components/base/TgLink.svelte";
  import { get } from "$lib/services/rest";
  import { onMount } from "svelte";

  let isApiAvailable = true;

  onMount(async () => {
    try {
      const res = await get("status");
      if (res.status !== "UP") {
        isApiAvailable = false;
      }
    } catch (err) {
      isApiAvailable = false;
      console.error("err: ", err);
    }
  });
</script>

<svelte:head>
  <title>Guesstimator - Home</title>
  <meta name="description" content="The Guesstimator home page" />
</svelte:head>
<div class="text-center">
  <TgHeadingMain>Welcome to</TgHeadingMain>
  <TgHeadingTitle>The Guesstimator</TgHeadingTitle>
  <TgParagraph>
    This is an app for "pointing" agile stories. To get started
  </TgParagraph>
  {#if isApiAvailable}
    <TgButton id="createRoomButton" type="primary" href="/rooms" class="mt-4">
      Create a room
    </TgButton>
  {:else}
    <TgParagraph class="text-orange-800 font-bold">
      The Guesstimator is currently unavailable, probably due to higher than
      expected demand. Please try again later, or if the problem persists for
      more than a day you can
      <TgLink
        href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
        >submit a bug report.
      </TgLink>
    </TgParagraph>
  {/if}
</div>
