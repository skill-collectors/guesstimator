<script lang="ts">
  import { page } from "$app/stores";
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingSub from "$lib/components/base/TgHeadingSub.svelte";
  import TgInputText from "$lib/components/base/TgInputText.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import Card from "$lib/components/Card.svelte";
  import { redirectToErrorPage } from "$lib/services/errorHandler";
  import * as localStorage from "$lib/services/localStorage";
  import { ApiEndpointNotFoundError } from "$lib/services/rest";
  import * as websockets from "$lib/services/websockets";
  import type { Room, User } from "$lib/services/rooms";
  import * as rooms from "$lib/services/rooms";
  import { onMount, onDestroy } from "svelte";
  import InvalidRoom from "./InvalidRoom.svelte";

  let notFound = false;
  const roomId = $page.params.roomId;
  const url = $page.url;

  let hostKey: string | null = null;
  let userKey: string | null = null;
  let usernameFieldValue = "";
  let roomData: Room | null = null;
  let webSocket: WebSocket | null = null;

  onMount(async () => {
    const hostData = localStorage.getHostData(roomId);
    hostKey = hostData.hostKey;

    const userData = localStorage.getUserData(roomId);
    userKey = userData.userKey;

    webSocket = websockets.connect();
    webSocket.onmessage = onWebSocketMessage;
    await loadRoomData();
  });

  onDestroy(() => {
    websockets.disconnect(webSocket);
  });

  function onWebSocketMessage(event: MessageEvent) {
    console.log(event);
  }

  async function loadRoomData() {
    try {
      roomData = await rooms.getRoom(roomId, userKey);
    } catch (err) {
      if (err instanceof ApiEndpointNotFoundError) {
        notFound = true;
      } else {
        redirectToErrorPage(err);
      }
    }
  }

  let currentUser: User | undefined;
  $: {
    currentUser = roomData?.users.find(
      (user) => user.userKey !== undefined && user.userKey === userKey
    );
  }

  async function handleJoinRoomClick() {
    if (roomData !== null) {
      const result = await rooms.joinRoom(roomData.roomId, usernameFieldValue);
      userKey = result.userKey;
      localStorage.storeUserData(
        result.roomId,
        result.userKey,
        usernameFieldValue
      );
    }
  }

  async function setSelection(size = "") {
    if (currentUser !== undefined && userKey !== null) {
      currentUser.vote = size;
      await rooms.vote(roomId, userKey, size);
    }
  }

  async function setIsRevealed(isRevealed: boolean) {
    if (roomData !== null && hostKey !== null) {
      await rooms.setIsRevealed(roomData.roomId, isRevealed, hostKey);
    }
  }

  async function handleDeleteRoom() {
    if (roomData === null) {
      return;
    }
    if (hostKey === null) {
      return;
    }
    await rooms.deleteRoom(roomData.roomId, hostKey);
    localStorage.deleteHostKey(roomData.roomId);
    window.location.href = "/";
  }
</script>

{#if notFound}
  <InvalidRoom />
{:else if roomData === null}
  <TgParagraph>Loading room...</TgParagraph>
{:else}
  <header class="mt-8">
    Room URL: <span class="whitespace-nowrap">{url}</span>
    {#if hostKey}
      <TgButton
        id="deleteRoomButton"
        type="danger"
        class="m-2"
        on:click={handleDeleteRoom}>X</TgButton
      >
    {/if}
  </header>
  <section class="mt-8">
    <TgHeadingSub>Current votes:</TgHeadingSub>
    <TgParagraph>
      Cards are
      {#if roomData.isRevealed}
        <strong>visible</strong>
        {#if hostKey}
          <TgButton
            id="hideCardsButton"
            type="secondary"
            on:click={() => setIsRevealed(false)}>Hide cards</TgButton
          >
        {/if}
      {:else}
        <strong>not visible</strong>
        {#if hostKey}
          <TgButton
            id="showCardsButton"
            type="secondary"
            on:click={() => setIsRevealed(true)}>Reveal cards</TgButton
          >
        {/if}
      {/if}
    </TgParagraph>
    {#each roomData?.users as user (user.userId)}
      <Card
        username={user.username}
        isRevealed={roomData.isRevealed}
        hasValue={user.hasVote}
        value={user.vote}
      />
    {/each}
  </section>
  {#if !roomData?.isRevealed}
    <section class="mt-32">
      {#if currentUser !== undefined}
        <TgHeadingSub>Your votes:</TgHeadingSub>
        {#each roomData.validSizes as size}
          {#if size === currentUser.vote}
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
        <TgButton type="danger" class="m-2" on:click={() => setSelection("")}
          >Clear</TgButton
        >
        <TgParagraph
          >You are joined as <strong>{currentUser.username}</strong
          ></TgParagraph
        >
      {:else}
        <TgParagraph
          >If you'd like to vote, enter a name and join the room:</TgParagraph
        >
        <TgInputText
          name="newUser"
          maxlength={30}
          bind:value={usernameFieldValue}
        />
        <TgButton type="primary" on:click={handleJoinRoomClick}
          >Join room</TgButton
        >
      {/if}
    </section>
  {/if}
{/if}
