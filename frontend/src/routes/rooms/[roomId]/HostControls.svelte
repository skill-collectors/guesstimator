<script type="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import { createEventDispatcher } from "svelte";

  export let isHost: boolean;
  export let isRevealed: boolean;
  export let isPending = false;

  const dispatch = createEventDispatcher();
</script>

{#if isHost}
  <TgParagraph>
    {#if isPending === true}
      <Loader />
    {:else if isRevealed}
      <TgButton
        id="hideCardsButton"
        type="secondary"
        on:click={() => dispatch("reset")}>Reset</TgButton
      >
    {:else}
      <TgButton
        id="showCardsButton"
        type="secondary"
        on:click={() => dispatch("reveal")}>Reveal cards</TgButton
      >
    {/if}
  </TgParagraph>
{/if}
