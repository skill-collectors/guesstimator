<script lang="ts">
  import { page } from "$app/stores";
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingSub from "$lib/components/base/TgHeadingSub.svelte";
  import TgInputText from "$lib/components/base/TgInputText.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import Card from "$lib/components/Card.svelte";
  import * as localStorage from "$lib/services/localStorage";
  import { GuesstimatorWebSocket } from "$lib/services/websockets";
  import type { Room, User } from "$lib/services/rooms";
  import * as rooms from "$lib/services/rooms";
  import { onMount, onDestroy } from "svelte";
  import InvalidRoom from "./InvalidRoom.svelte";

  let notFound = false;
  const roomId = $page.params.roomId;
  const url = $page.url;

  let hostKey: string | undefined = undefined;
  let userKey: string | null = null;
  let usernameFieldValue = "";
  let roomData: Room | null = null;
  let webSocket: GuesstimatorWebSocket | null = null;

  onMount(async () => {
    const hostData = localStorage.getHostData(roomId);
    hostKey = hostData.hostKey;

    const userData = localStorage.getUserData(roomId);
    userKey = userData.userKey;

    console.log("Creating websocket");
    webSocket = new GuesstimatorWebSocket(
      roomId,
      onWebSocketMessage,
      onWebSocketError,
      onWebSocketOpen,
      hostKey
    );
  });

  onDestroy(() => {
    console.log("Closing websocket");
    if (webSocket !== null) {
      webSocket.close();
    }
  });

  function onWebSocketMessage(this: WebSocket, event: MessageEvent) {
    console.log(event);
  }

  function onWebSocketError(this: WebSocket, event: Event) {
    console.error(event);
  }

  function onWebSocketOpen(this: WebSocket) {
    console.log("Socket is open");
    webSocket?.subscribe();
  }

  let currentUser: User | undefined;
  $: {
    currentUser = roomData?.users.find(
      (user) => user.userKey !== undefined && user.userKey === userKey
    );
  }

  function handleJoinRoomClick() {
    webSocket?.join(usernameFieldValue);
  }

  function handleVote(vote = "") {
    if (currentUser !== undefined && userKey !== null) {
      currentUser.vote = vote;
      webSocket?.vote(vote);
    }
  }

  function reveal() {
    webSocket?.reveal();
  }

  function reset() {
    webSocket?.reset();
  }

  async function handleDeleteRoom() {
    if (roomData === null) {
      return;
    }
    if (hostKey === undefined) {
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
          <TgButton id="hideCardsButton" type="secondary" on:click={reset}
            >Reset</TgButton
          >
        {/if}
      {:else}
        <strong>not visible</strong>
        {#if hostKey}
          <TgButton id="showCardsButton" type="secondary" on:click={reveal}
            >Reveal cards</TgButton
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
        {#each roomData.validSizes as vote}
          {#if vote === currentUser.vote}
            <TgButton type="primary" class="m-2" on:click={() => handleVote()}
              >{vote}</TgButton
            >
          {:else}
            <TgButton
              type="secondary"
              class="m-2"
              on:click={() => handleVote(vote)}>{vote}</TgButton
            >
          {/if}
        {/each}
        <TgButton type="danger" class="m-2" on:click={() => handleVote("")}
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
