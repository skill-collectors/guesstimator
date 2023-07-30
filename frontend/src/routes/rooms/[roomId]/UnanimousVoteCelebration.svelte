<script lang="ts">
  import RainbowText from "$lib/components/RainbowText.svelte";
  import TgConfetti from "$lib/components/base/TgConfetti.svelte";
  import type { Room } from "$lib/services/rooms";

  export let roomData: Room;

  /**
   * True if all votes are the same, and false otherwise.
   */
  $: celebrate = (function unanimousVote() {
    const votes = roomData?.users
      .filter((user) => user.username.length > 0) // Users who haven't joined don't count
      .map((user) => user.vote);
    console.log(votes);
    if (votes.includes("") || votes.includes("?") || votes.includes("∞")) {
      // If anyone is uncertain, that's no cause for celebration
      return false;
    }
    if (votes === undefined || votes.length === 0) {
      // If nobody voted, then nobody agrees
      return false;
    }

    const firstVote = votes[0];

    for (const vote of votes) {
      if (vote !== firstVote) {
        return false;
      }
    }

    return true;
  })();
</script>

{#if celebrate}
  <RainbowText>Everyone agrees!</RainbowText>
  <TgConfetti />
{/if}
