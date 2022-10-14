<script type="ts">
  import { onMount } from "svelte";
  import { createRoom } from "$lib/services/rooms";
  import type { Room } from "$lib/services/rooms";
  import { setRoom } from "$lib/services/localStorage";

  let roomData: Room;
  onMount(async () => {
    roomData = await createRoom();
    setRoom(roomData);
    window.location.href = `/rooms/${roomData.roomId}`;
  });
</script>

{#if roomData == null}
  <p>Hang on while we get a room ready for you...</p>
{/if}
