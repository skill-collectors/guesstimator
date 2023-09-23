<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import TgHeadingMinor from "$lib/components/base/TgHeadingMinor.svelte";
  import Loader from "$lib/components/icons/Loader.svelte";
  import { createEventDispatcher } from "svelte";

  let isPending = false;

  const dispatch = createEventDispatcher();

  function handleDeleteRoom() {
    isPending = true;
    dispatch("deleteRoom");
  }
</script>

<section id="hostControls">
  {#if isPending}
    <Loader />
  {:else}
    <TgHeadingMinor>You are the room host</TgHeadingMinor>
    <TgParagraph>Use the controls below to manage the room.</TgParagraph>
    <TgButton
      id="deleteRoomButton"
      type="danger"
      class="m-2 inline"
      on:click={handleDeleteRoom}>Delete Room</TgButton
    >
  {/if}
</section>
