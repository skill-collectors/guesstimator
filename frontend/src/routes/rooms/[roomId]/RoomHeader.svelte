<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import { createEventDispatcher } from "svelte";
  import TgShare from "$lib/components/base/TgShare.svelte";

  export let url: URL;
  export let isHost: boolean;

  let pendingDelete = false;

  let shareData = {
    title: "Guesstimator",
    text: "An app for 'pointing' agile stories",
    url: url.toString()
  };
  let canShare = true;

  if (!navigator.canShare) {
    canShare = false;
  }

  function handleShareRoom() {
    if (canShare) {
      navigator.share(shareData);
    }
  }

  const dispatch = createEventDispatcher();

  function handleDeleteRoom() {
    pendingDelete = true;
    dispatch("click-delete");
  }
</script>

<header class="mt-8">
  {#if canShare}
    <TgButton
      id="shareRoomButton"
      type="primary"
      class="m-2 p-1 bg-white text-black shadow"
      on:click={handleShareRoom}><TgShare /></TgButton
    >
    Room URL: <span class="whitespace-nowrap">{url}</span>
  {:else}
    Room URL: <span class="whitespace-nowrap">{url}</span>
  {/if}
  {#if isHost}
    {#if pendingDelete}
      <Loader />
    {:else}
      <TgButton
        id="deleteRoomButton"
        type="danger"
        class="m-2 inline"
        on:click={handleDeleteRoom}>X</TgButton
      >
    {/if}
  {/if}
</header>
