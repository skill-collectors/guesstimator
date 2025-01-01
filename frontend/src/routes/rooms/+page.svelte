<script lang="ts">
  import { onMount } from "svelte";
  import { createRoom } from "$lib/services/rooms";
  import type { Room } from "$lib/services/rooms";
  import { storeHostData } from "$lib/services/localStorage";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import Loader from "$lib/components/icons/Loader.svelte";

  let roomData = $state<Room | undefined>(undefined);
  onMount(async () => {
    roomData = await createRoom();
    if (roomData.hostKey === undefined) {
      throw new Error("Got a room, but no hostKey");
    } else {
      storeHostData(roomData.roomId, roomData.hostKey);
      window.location.href = `/rooms/${roomData.roomId}`;
    }
  });
</script>

<svelte:head>
  <title>Guesstimator - New</title>
  <meta name="description" content="New room redirect" />
</svelte:head>
{#if roomData == null}
  <TgParagraph>Hang on while we get a room ready for you...</TgParagraph>
  <Loader />
{/if}
