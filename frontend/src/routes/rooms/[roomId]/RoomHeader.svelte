<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import Loader from "$lib/components/icons/Loader.svelte";
  import { createEventDispatcher } from "svelte";
  import ShareIcon from "$lib/components/icons/ShareIcon.svelte";

  export let url: URL;
  export let isHost: boolean;

  let pendingDelete = false;

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

  const dispatch = createEventDispatcher();

  function handleDeleteRoom() {
    pendingDelete = true;
    dispatch("click-delete");
  }
</script>

<header class="mt-8">
  {#if canShare}
    <TgButton id="shareRoomButton" type="secondary" on:click={handleShareRoom}
      ><ShareIcon /></TgButton
    >
  {/if}
  Room URL: <span class="whitespace-nowrap">{url}</span>
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
