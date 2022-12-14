<script type="ts">
  import TgButton from "$lib/components/base/TgButton.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import { createEventDispatcher } from "svelte";

  export let url: URL;
  export let isHost: boolean;

  let pendingDelete = false;

  const dispatch = createEventDispatcher();

  function handleDeleteRoom() {
    pendingDelete = true;
    dispatch("click-delete");
  }
</script>

<header class="mt-8">
  Room URL: <span class="whitespace-nowrap">{url}</span>
  {#if isHost}
    {#if pendingDelete}
      <Loader />
    {:else}
      <TgButton
        id="deleteRoomButton"
        type="danger"
        class="m-2"
        on:click={handleDeleteRoom}>X</TgButton
      >
    {/if}
  {/if}
</header>
