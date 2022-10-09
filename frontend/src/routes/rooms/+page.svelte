<script type="ts">
  import { onMount } from "svelte";
  import { post } from "$lib/services/rest";

  interface Room {
    roomId: string;
    hostKey?: string;
    validSizes: string;
  }
  let roomData: Room;
  onMount(async () => {
    roomData = await post("/rooms/new");
    window.location.href = `/rooms/${roomData.roomId}`;
  });
</script>

{#if roomData == null}
  <p>Hang on while we get a room ready for you...</p>
{/if}
