<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import CopyIcon from "$lib/components/icons/CopyIcon.svelte";
  import ShareIcon from "$lib/components/icons/ShareIcon.svelte";

  export let url: URL;

  const shareData = {
    title: "Join my Guesstimator room",
    text: "Click to help us size some agile stories",
    url: url.toString(),
  };

  const canShare =
    navigator.canShare === undefined ? false : navigator.canShare();

  let copyConfirmationText: string | null = null;

  function handleShareRoom() {
    if (canShare) {
      navigator.share(shareData);
    }
  }

  function displayCopyMessage(message: string) {
    copyConfirmationText = message;
    window.setTimeout(() => {
      copyConfirmationText = null;
    }, 2000);
  }

  async function handleCopyClick() {
    try {
      await navigator.clipboard.writeText(url.href);
      displayCopyMessage("Copied!");
    } catch (err) {
      displayCopyMessage("Failed!");
    }
  }
</script>

<header class="mt-8">
  Room URL: <span class="whitespace-nowrap">{url}</span>
  {#if canShare}
    <TgButton id="shareRoomButton" type="secondary" on:click={handleShareRoom}>
      <ShareIcon />
    </TgButton>
  {/if}
  <TgButton
    id="copyUrlButton"
    type="secondary"
    on:click={handleCopyClick}
    class="relative"
  >
    <CopyIcon />
    {#if copyConfirmationText !== null}
      <div
        class="absolute -left-2 top-1.5 z-10 animate-fade-out-up animate-duration-2000 bg-slate-100 border-slate-900 border-2 text-slate-900"
      >
        {copyConfirmationText}
      </div>
    {/if}
  </TgButton>
</header>
