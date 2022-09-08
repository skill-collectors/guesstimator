<script lang="ts">
  import { post } from "$lib/services/rest";

  interface RoomData {
    roomId: string;
    hostKey: string;
    validSizes: string;
  }
  let roomData: RoomData | null = null;
  async function createNewRoom() {
    roomData = await post("/rooms/new");
  }
</script>

<div class="text-center">
  <p class="paragraph mb-3">
    This is an app for "pointing" agile stories. To get started
  </p>
  <button on:click={createNewRoom} class="btn btn-primary">Create a room</button
  >
  {#if roomData != null}
    <ul>
      <li><strong>Room ID:</strong>{roomData?.roomId}</li>
      <li><strong>Host Key:</strong>{roomData?.hostKey}</li>
      <li><strong>Valid sizes:</strong>{roomData?.validSizes}</li>
    </ul>
  {/if}
</div>
