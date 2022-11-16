<script type="ts">
  import { onMount } from "svelte";
  import { createRoom } from "$lib/services/rooms";
  import type { Room } from "$lib/services/rooms";
  import { storeRoom } from "$lib/services/localStorage";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";

  let roomData: Room;
  onMount(async () => {
    roomData = await createRoom();
    storeRoom(roomData);
    window.location.href = `/rooms/${roomData.roomId}`;
  });
</script>

{#if roomData == null}
  <TgParagraph>Hang on while we get a room ready for you...</TgParagraph>
{/if}
