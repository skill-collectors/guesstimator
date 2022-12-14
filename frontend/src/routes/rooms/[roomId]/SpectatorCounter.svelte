<script type="ts">
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import type { Room } from "$lib/services/rooms";

  export let roomData: Room;

  $: spectatorCount = roomData?.users.filter(
    (user) => user.username === ""
  ).length;
</script>

{#if spectatorCount !== undefined}
  <TgParagraph>
    {#if spectatorCount === 0}
      There are no spectators.
    {:else if spectatorCount === 1}
      There is 1 spectator.
    {:else}
      There are {spectatorCount} spectators.
    {/if}
  </TgParagraph>
{/if}
