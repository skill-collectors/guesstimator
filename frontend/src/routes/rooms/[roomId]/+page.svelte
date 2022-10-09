<script lang="ts">
  import type { PageData } from "./$types";
  import { del } from "$lib/services/rest";

  export let data: PageData;

  async function handleDeleteRoom() {
    await del(`/rooms/${data.roomData.roomId}`);
    window.location.href = "/";
  }
</script>

<section class="text-center">
  <h2 class="heading h-sub">
    Welcome to room {data.roomData.roomId}
  </h2>
  <p>Valid sizes are {data.roomData.validSizes}</p>
  <p>
    Cards are
    {#if data.roomData.isRevealed}
      <strong>visible</strong>
    {:else}
      <strong>not visible</strong>
    {/if}
  </p>
  <button class="btn danger" on:click={handleDeleteRoom}>Delete room</button>
</section>
