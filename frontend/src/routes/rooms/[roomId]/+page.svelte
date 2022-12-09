<script lang="ts">
  import { page } from "$app/stores";
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingSub from "$lib/components/base/TgHeadingSub.svelte";
  import TgInputText from "$lib/components/base/TgInputText.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import * as localStorage from "$lib/services/localStorage";
  import { GuesstimatorWebSocket } from "$lib/services/websockets";
  import type { Room, User } from "$lib/services/rooms";
  import * as rooms from "$lib/services/rooms";
  import InvalidRoom from "./InvalidRoom.svelte";
  import { onDestroy, onMount } from "svelte";
  import Loader from "$lib/components/Loader.svelte";
  import RoomHeader from "./RoomHeader.svelte";
  import SpectatorCounter from "./SpectatorCounter.svelte";
  import HostControls from "./HostControls.svelte";
  import CardGroup from "./CardGroup.svelte";
  import ResultsChart from "./ResultsChart.svelte";

  let notFound = false;
  const roomId = $page.params.roomId;
  const url = $page.url;

  let usernameFieldValue = "";
  let roomData: Room | null = null;

  let webSocket: GuesstimatorWebSocket | undefined;

  let loadingStatus = "";
  let pendingRevealOrReset = false;

  $: currentUser = roomData?.users.find((user) => user.userKey !== undefined);

  $: if (currentUser?.userKey !== undefined && webSocket !== undefined) {
    webSocket.userKey = currentUser.userKey;
    localStorage.storeUserData(
      roomId,
      currentUser.userKey,
      currentUser.username
    );
  }

  onMount(() => {
    const hostData = localStorage.getHostData(roomId);
    const hostKey = hostData.hostKey;

    const userData = localStorage.getUserData(roomId);
    const userKey = userData.userKey;

    loadingStatus = "Connecting to room...";
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
    loadingStatus = "Subscribing to updates...";
    webSocket?.subscribe();
  }

  function onWebSocketMessage(this: WebSocket, event: MessageEvent) {
    console.log(event);

    loadingStatus = "";

    if (webSocket === undefined) {
      // It would be really weird if this happend.
      console.log("Got a message, but the websocket is gone.");
      return;
    }
    const json = event.data;
    if (json !== undefined) {
      const message = JSON.parse(json);
      if (message.status !== 200) {
        console.error(message);
        if (message.status === 404) {
          notFound = true;
        }
      } else if (
        message.data.type === "DELETE_USER" &&
        message.data.result === "SUCCESS"
      ) {
        webSocket.close();
        localStorage.clearUserData(roomId);
        window.location.reload();
      } else {
        roomData = message.data;
        pendingRevealOrReset = false;
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

  function handleReveal() {
    pendingRevealOrReset = true;
    webSocket?.reveal();
  }

  function handleReset() {
    pendingRevealOrReset = true;
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
  <TgParagraph>{loadingStatus}</TgParagraph>
  <Loader />
{:else}
  <RoomHeader
    {url}
    isHost={webSocket?.hostKey !== undefined}
    on:click-delete={handleDeleteRoom}
  />
  <SpectatorCounter {roomData} />
  <section id="currentVotes" class="mt-8">
    <TgHeadingSub>Current votes:</TgHeadingSub>
    {#if webSocket?.hostKey !== undefined}
      <HostControls
        {roomData}
        on:reset={handleReset}
        on:reveal={handleReveal}
      />
    {/if}
    <div class="mb-6">
      <CardGroup {roomData} />
    </div>
  </section>
  {#if roomData?.isRevealed}
    <section id="resultsChart" class="m-x-auto max-w-xl">
      <ResultsChart {roomData} />
    </section>
  {:else}
    <section id="userControls" class="mt-32">
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
          <TgButton type="danger" class="m-2" on:click={handleLeave}
            >Leave</TgButton
          >
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
        <TgButton type="primary" class="m-2" on:click={handleJoinRoomClick}
          >Join room</TgButton
        >
      {/if}
    </section>
  {/if}
{/if}
