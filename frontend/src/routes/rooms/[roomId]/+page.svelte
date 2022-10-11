<script lang="ts">
  import type { PageData } from "./$types";
  import { del } from "$lib/services/rest";
  import { onMount } from "svelte";

  export let data: PageData;

  let url = "";
  onMount(() => (url = window.location.href));

  const sizeValues = data.roomData.validSizes.split(" ");
  let selectedSize = "";

  function setSelection(size = "") {
    selectedSize = size;
  }

  async function handleDeleteRoom() {
    await del(`/rooms/${data.roomData.roomId}`);
    window.location.href = "/";
  }
</script>

<header class="mt-8">
  Room URL: {url}
  <button class="btn danger m-2" on:click={handleDeleteRoom}>X</button>
</header>
<section class="mt-8">
  <h3 class="heading h-sub">Current votes:</h3>
  <p>
    Cards are
    {#if data.roomData.isRevealed}
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
