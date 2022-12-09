<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import type { Room, User } from "$lib/services/rooms";
  import { createEventDispatcher } from "svelte";

  export let roomData: Room;
  export let currentUser: User;

  const dispatch = createEventDispatcher();

  function handleVote(vote = "") {
    dispatch("vote", { vote });
  }
</script>

{#each roomData.validSizes as vote}
  {#if vote === currentUser.vote}
    <TgButton type="primary" class="m-2" on:click={() => handleVote()}
      >{vote}</TgButton
    >
  {:else}
    <TgButton type="secondary" class="m-2" on:click={() => handleVote(vote)}
      >{vote}</TgButton
    >
  {/if}
{/each}
<TgButton type="danger" class="m-2" on:click={() => handleVote()}
  >Clear</TgButton
>
