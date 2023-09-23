<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import ShareIcon from "$lib/components/icons/ShareIcon.svelte";

  export let url: URL;

  let shareData = {
    title: "Join my Guesstimator room",
    text: "Click to help us size some agile stories",
    url: url.toString(),
  };

  let canShare =
    navigator.canShare === undefined ? false : navigator.canShare();

  function handleShareRoom() {
    if (canShare) {
      navigator.share(shareData);
    }
  }
</script>

<header class="mt-8">
  Room URL: <span class="whitespace-nowrap">{url}</span>
  {#if canShare}
    <TgButton id="shareRoomButton" type="secondary" on:click={handleShareRoom}
      ><ShareIcon /></TgButton
    >
  {/if}
</header>
