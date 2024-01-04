<script lang="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import TgHeadingMinor from "$lib/components/base/TgHeadingMinor.svelte";
  import Loader from "$lib/components/icons/Loader.svelte";
  import { createEventDispatcher } from "svelte";
  import type { Room } from "$lib/services/rooms";
  import TgInputText from "$lib/components/base/TgInputText.svelte";
  import TrashIcon from "$lib/components/icons/TrashIcon.svelte";

  export let roomData: Room;

  interface SizeTemplate {
    name: string;
    sizes: string;
  }

  const templates: SizeTemplate[] = [
    { name: "Fibonacci", sizes: "1 2 3 5 8 13 20 ? ∞" },
    { name: "T-Shirts", sizes: "XS S M L XL ? ∞" },
    { name: "Emoji", sizes: "🐜 🐁 🐇 🐕 🐻 🐘 🐋 ? ∞" },
  ];

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

  function handleTemplateSize(templateSizes: string) {
    isUpdatingSizes = false;
    newSizes = templateSizes;
    dispatch("newSizes", { newSizes: templateSizes });
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
    {#if isUpdatingSizes}
      <TgParagraph
        >Enter new sizes (separate each size with a space):
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
      </TgParagraph>
      <TgParagraph>Or click one of the following presets:</TgParagraph>
      <ul>
        {#each templates as template}
          <li class="m-1">
            <TgButton
              type="success"
              on:click={() => handleTemplateSize(template.sizes)}
              >{template.name}</TgButton
            >
            {template.sizes}
          </li>
        {/each}
      </ul>
    {:else}
      <TgParagraph>
        Valid room sizes:
        {roomData.validSizes}
        <TgButton
          id="editValidSizesButton"
          type="secondary"
          class="m-2 inline"
          on:click={handleInitUpdateSizes}>Edit</TgButton
        >
      </TgParagraph>
    {/if}
    <TgButton
      id="deleteRoomButton"
      type="danger"
      class="m-2 inline"
      on:click={handleDeleteRoom}
    >
      <TrashIcon />
      Delete Room
    </TgButton>
  {/if}
</section>
