<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
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
</section>
