<script lang="ts">
  interface RoomData {
    roomId: string;
    hostKey: string;
    validSizes: string;
  }
  let roomData: RoomData | null = null;
  async function createNewRoom() {
    console.log("click!");
    const response = await fetch(
      "https://agile-poker-api-dev.superfun.link/rooms/new",
      { method: "POST", mode: "cors" }
    );
    if (response.ok) {
      roomData = await response.json();
    } else {
      console.log(await response.text());
    }
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
