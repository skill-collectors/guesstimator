<script lang="ts">
  import { page } from "$app/stores";
  import * as localStorage from "$lib/services/localStorage";
  import { NotFoundError } from "$lib/services/rest";
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
      if (err instanceof NotFoundError) {
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
  <p>Loading room...</p>
{:else}
  <header class="mt-8">
    Room URL: {url}
    <button class="btn danger m-2" on:click={handleDeleteRoom}>X</button>
  </header>
  <section class="mt-8">
    <h3 class="heading h-sub">Current votes:</h3>
    <p>
      Cards are
      {#if roomData.isRevealed}
        <strong>visible</strong>
      {:else}
        <strong>not visible</strong>
      {/if}
    </p>
  </section>
  <section class="mt-32">
    <h3 class="heading h-sub">Your vote:</h3>
    {#each sizeValues as size}
      {#if size === selectedSize}
        <button class="btn primary m-2" on:click={() => setSelection()}
          >{size}</button
        >
      {:else}
        <button class="btn secondary m-2" on:click={() => setSelection(size)}
          >{size}</button
        >
      {/if}
    {/each}
  </section>
{/if}
