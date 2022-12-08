<script type="ts">
  import Card from "$lib/components/Card.svelte";
  import type { Room } from "$lib/services/rooms";

  export let roomData: Room;

  $: players =
    roomData?.users.filter((user) => user.username?.length > 0) ?? [];
</script>

{#each players as user (user.userId)}
  <Card
    username={user.username}
    isRevealed={roomData.isRevealed}
    hasValue={user.hasVote}
    value={user.vote}
  />
{/each}
