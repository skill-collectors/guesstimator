<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import Loader from "$lib/components/icons/Loader.svelte";
  import type { Room } from "$lib/services/rooms";
  import { createEventDispatcher } from "svelte";

  export let roomData: Room;

  let isPending = false;
  // Reset isPending whenever isRevealed changes
  $: if (roomData.isRevealed !== undefined) {
    isPending = false;
  }

  $: joinedUsers = roomData.users.filter((user) => user.username.length > 0);

  $: isEveryoneReady = joinedUsers.every((user) => user.hasVote);

  const dispatch = createEventDispatcher();

  function handleReveal() {
    isPending = true;
    dispatch("reveal");
  }

  function handleReset() {
    isPending = true;
    dispatch("reset");
  }
</script>

<TgParagraph>
  {#if isPending === true}
    <Loader />
  {:else if roomData.isRevealed}
    <TgButton id="hideCardsButton" type="secondary" on:click={handleReset}
      >Reset</TgButton
    >
  {:else if joinedUsers.length === 0}
    <TgParagraph>Waiting for people to join...</TgParagraph>
  {:else if isEveryoneReady}
    <TgButton id="showCardsButton" type="success" on:click={handleReveal}
      >Reveal cards</TgButton
    >
  {:else}
    <TgButton id="showCardsButton" type="secondary" on:click={handleReveal}
      >Reveal cards</TgButton
    >
  {/if}
</TgParagraph>
