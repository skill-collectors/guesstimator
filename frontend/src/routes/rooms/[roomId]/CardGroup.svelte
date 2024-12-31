<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import type { Room } from "$lib/services/rooms";

  interface Props {
    roomData: Room;
  }

  let { roomData }: Props = $props();

  let players =
    $derived(roomData?.users.filter((user) => user.username?.length > 0) ?? []);
</script>

<div class="flex justify-center flex-wrap">
  {#each players as user (user.userId)}
    <Card
      username={user.username}
      isRevealed={roomData.isRevealed}
      hasValue={user.hasVote}
      value={user.vote}
    />
  {/each}
</div>
