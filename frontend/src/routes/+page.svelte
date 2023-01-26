<script>
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgHeadingTitle from "$lib/components/base/TgHeadingTitle.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import { get } from "$lib/services/rest";
  import { onMount } from "svelte";

  var status = true;

  onMount(async () => {
    try {
      const res = await get("status");
      if (res.status !== "UP") {
        status = false;
      }
    } catch (err) {
      console.error("err: ", err);
    }
  });
</script>

<div class="text-center">
  <TgHeadingMain>Welcome to</TgHeadingMain>
  <TgHeadingTitle>The Guesstimator</TgHeadingTitle>
  <TgParagraph>
    This is an app for "pointing" agile stories. To get started
  </TgParagraph>
  {#if status}
    <TgButton id="createRoomButton" type="primary" href="/rooms" class="mt-4"
      >Create a room</TgButton
    >
  {:else}
    <div id="apiCheck" class="text-red-500 font-bold">API IS UNAVAILABLE</div>
  {/if}
</div>
