<script lang="ts">
  import { page } from "$app/stores";
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingSub from "$lib/components/base/TgHeadingSub.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import * as localStorage from "$lib/services/localStorage";
  import { ApiEndpointNotFoundError } from "$lib/services/rest";
  import type { Room } from "$lib/services/rooms";
  import * as rooms from "$lib/services/rooms";
  import { onMount } from "svelte";
  import InvalidRoom from "./InvalidRoom.svelte";

  let notFound = false;
  const roomId = $page.params.roomId;
  const url = $page.url;
  let roomData: Room | null = null;
  let sizeValues: string[] = [];

  onMount(async () => {
    roomData = localStorage.getRoom(roomId);
    try {
      if (roomData === null) {
        roomData = await rooms.getRoom(roomId);
        localStorage.setRoom(roomData);
      }
      sizeValues = roomData.validSizes.split(" ");
    } catch (err) {
      if (err instanceof ApiEndpointNotFoundError) {
        notFound = true;
      }
    }
  });

  let selectedSize = "";

  function setSelection(size = "") {
    selectedSize = size;
  }

  async function handleDeleteRoom() {
    if (roomData !== null) {
      await rooms.deleteRoom(roomData.roomId);
      window.location.href = "/";
    }
  }
</script>

{#if notFound}
  <InvalidRoom />
{:else if roomData === null}
  <TgParagraph>Loading room...</TgParagraph>
{:else}
  <header class="mt-8">
    Room URL: {url}
    <TgButton type="danger" class="m-2" on:click={handleDeleteRoom}>X</TgButton>
  </header>
  <section class="mt-8">
    <TgHeadingSub>Current votes:</TgHeadingSub>
    <TgParagraph>
      Cards are
      {#if roomData.isRevealed}
        <strong>visible</strong>
      {:else}
        <strong>not visible</strong>
      {/if}
    </TgParagraph>
  </section>
  <section class="mt-32">
    <TgHeadingSub>Your votes:</TgHeadingSub>
    {#each sizeValues as size}
      {#if size === selectedSize}
        <TgButton type="primary" class="m-2" on:click={() => setSelection()}
          >{size}</TgButton
        >
      {:else}
        <TgButton
          type="secondary"
          class="m-2"
          on:click={() => setSelection(size)}>{size}</TgButton
        >
      {/if}
    {/each}
  </section>
{/if}
