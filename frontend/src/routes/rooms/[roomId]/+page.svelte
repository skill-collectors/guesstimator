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
  import InvalidRoom from "./InvalidRoom.svelte";
  import { onDestroy, onMount } from "svelte";

  let notFound = false;
  const roomId = $page.params.roomId;
  const url = $page.url;

  let currentUser: User | undefined;
  let usernameFieldValue = "";
  let roomData: Room | null = null;

  let webSocket: GuesstimatorWebSocket | undefined;

  onMount(() => {
    const hostData = localStorage.getHostData(roomId);
    const hostKey = hostData.hostKey;

    const userData = localStorage.getUserData(roomId);
    const userKey = userData.userKey;

    webSocket = new GuesstimatorWebSocket(
      roomId,
      onWebSocketMessage,
      onWebSocketError,
      onWebSocketOpen,
      onWebSocketClose,
      userKey,
      hostKey
    );
  });

  onDestroy(() => {
    webSocket?.close();
  });

  function onWebSocketOpen(this: WebSocket) {
    console.log("Connection established");
    webSocket?.subscribe();
  }

  function onWebSocketMessage(this: WebSocket, event: MessageEvent) {
    console.log(event);
    if (webSocket === undefined) {
      // It would be really weird if this happend.
      console.log("Got a message, but websocket is undefined!?");
      return;
    }
    const json = event.data;
    if (json !== undefined) {
      const message = JSON.parse(json);
      if (message.status !== 200) {
        console.error(message.error);
        if (message.status === 404) {
          notFound = true;
        }
      } else if (
        message.data.type === "DELETE_USER" &&
        message.data.result === "SUCCESS"
      ) {
        webSocket.close();
        window.location.reload();
      } else {
        roomData = message.data;
        currentUser = roomData?.users.find(
          (user) => user.userKey !== undefined
        );
        if (currentUser === undefined) {
          console.log("NO CURRENT USER!");
        } else {
          webSocket.userKey = currentUser.userKey;
          if (currentUser.userKey !== undefined) {
            localStorage.storeUserData(
              roomId,
              currentUser.userKey,
              currentUser.username
            );
          }
        }
      }
    }
  }

  function onWebSocketError(this: WebSocket, event: Event) {
    console.log("WebSocket error");
    console.error(event);
  }

  function onWebSocketClose(this: WebSocket, event: Event) {
    console.log("WebSocket closed");
    console.log(event);
  }

  $: spectatorCount = roomData?.users.filter(
    (user) => user.username === ""
  ).length;

  $: players =
    roomData?.users.filter((user) => user.username?.length > 0) ?? [];

  function handleJoinRoomClick() {
    if (usernameFieldValue.length > 0) {
      webSocket?.join(usernameFieldValue);
    }
  }

  function handleVote(vote = "") {
    if (currentUser !== undefined) {
      currentUser.vote = vote;
      webSocket?.vote(vote);
    }
  }

  function handleLeave() {
    if (currentUser !== undefined) {
      webSocket?.leave();
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
    if (webSocket?.hostKey === undefined) {
      return;
    }
    await rooms.deleteRoom(roomData.roomId, webSocket.hostKey);
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
    {#if webSocket?.hostKey}
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
        {#if webSocket?.hostKey}
          <TgButton id="hideCardsButton" type="secondary" on:click={reset}
            >Reset</TgButton
          >
        {/if}
      {:else}
        <strong>not visible</strong>
        {#if webSocket?.hostKey}
          <TgButton id="showCardsButton" type="secondary" on:click={reveal}
            >Reveal cards</TgButton
          >
        {/if}
      {/if}
    </TgParagraph>
    {#each players as user (user.userId)}
      <Card
        username={user.username}
        isRevealed={roomData.isRevealed}
        hasValue={user.hasVote}
        value={user.vote}
      />
    {/each}
    <TgParagraph>
      {#if spectatorCount === 0}
        There are no spectators.
      {:else if spectatorCount === 1}
        There is 1 spectator.
      {:else}
        There are {spectatorCount} spectators.
      {/if}
    </TgParagraph>
  </section>
  {#if !roomData?.isRevealed}
    <section class="mt-32">
      {#if currentUser !== undefined && currentUser.username.length > 0}
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
        <TgParagraph>
          You are joined as <strong>{currentUser.username}</strong>
          <TgButton type="secondary" on:click={handleLeave}>Leave</TgButton>
        </TgParagraph>
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
