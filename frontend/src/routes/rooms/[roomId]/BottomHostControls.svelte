<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import TgHeadingMinor from "$lib/components/base/TgHeadingMinor.svelte";
  import Loader from "$lib/components/icons/Loader.svelte";
  import { createEventDispatcher } from "svelte";
  import type { Room } from "$lib/services/rooms";
  import TgInputText from "$lib/components/base/TgInputText.svelte";

  export let roomData: Room;

  let isPending = false;
  let isUpdatingSizes = false;
  let newSizes = roomData.validSizes.join(" ");

  const dispatch = createEventDispatcher();

  function handleInitUpdateSizes() {
    isUpdatingSizes = true;
  }

  function handleSubmitNewSizes() {
    isUpdatingSizes = false;
    dispatch("newSizes", { newSizes });
  }

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
    <TgParagraph>
      Valid room sizes:
      {#if isUpdatingSizes}
        <TgInputText
          name="newSizes"
          testId="newSizesInput"
          maxlength={100}
          bind:value={newSizes}
        />
        <TgButton
          id="editValidSizesButton"
          type="success"
          class="m-2 inline"
          on:click={handleSubmitNewSizes}>Save</TgButton
        >
      {:else}
        {roomData.validSizes}
        <TgButton
          id="editValidSizesButton"
          type="secondary"
          class="m-2 inline"
          on:click={handleInitUpdateSizes}>Edit</TgButton
        >
      {/if}
    </TgParagraph>
    <TgButton
      id="deleteRoomButton"
      type="danger"
      class="m-2 inline"
      on:click={handleDeleteRoom}>Delete Room</TgButton
    >
  {/if}
</section>
