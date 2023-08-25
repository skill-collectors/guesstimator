<script lang="ts">
  import { page } from "$app/stores";
  import TgButton from "$lib/components/base/TgButton.svelte";
  import TgHeadingSub from "$lib/components/base/TgHeadingSub.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
  import * as localStorage from "$lib/services/localStorage";
  import { GuesstimatorWebSocket } from "$lib/services/websockets";
  import type { Room } from "$lib/services/rooms";
  import * as rooms from "$lib/services/rooms";
  import InvalidRoom from "./InvalidRoom.svelte";
  import { onDestroy, onMount } from "svelte";
  import Loader from "$lib/components/Loader.svelte";
  import RoomHeader from "./RoomHeader.svelte";
  import HostControls from "./HostControls.svelte";
  import CardGroup from "./CardGroup.svelte";
  import ResultsChart from "./ResultsChart.svelte";
  import VoteControls from "./VoteControls.svelte";
  import NewUserForm from "./NewUserForm.svelte";

  let notFound = false;
  const roomId = $page.params.roomId;
  const url = $page.url;

  let webSocket: GuesstimatorWebSocket | undefined;
  let webSocketNeedsReconnect = false;
  let roomData: Room | null = null;

  let loadingStatus = "";

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
    connectWebSocket();
  });

  onDestroy(() => {
    webSocket?.close();
  });

  function connectWebSocket() {
    const hostData = localStorage.getHostData(roomId);
    const hostKey = hostData.hostKey;

    const userData = localStorage.getUserData(roomId);
    const userKey = userData.userKey;

    roomData = null;
    webSocketNeedsReconnect = false;
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
  }

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
    webSocketNeedsReconnect = true;
  }

  function handleNewUser(e: CustomEvent<{ username: string }>) {
    webSocket?.join(e.detail.username);
  }

  function handleVote(e: CustomEvent<{ vote: string }>) {
    if (currentUser !== undefined) {
      currentUser.vote = e.detail.vote;
      webSocket?.vote(e.detail.vote);
    }
  }

  function handleLeave() {
    if (currentUser !== undefined) {
      webSocket?.leave();
    }
  }

  function handleReveal() {
    webSocket?.reveal();
  }

  function handleReset() {
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

<svelte:head>
  <title>Guesstimator - {roomData?.roomId ?? "New"}</title>
  <meta name="description" content={`Page for room ${roomData?.roomId}`} />
</svelte:head>
{#if notFound}
  <InvalidRoom />
{:else if roomData === null}
  <TgParagraph>{loadingStatus}</TgParagraph>
  <Loader />
{:else if webSocketNeedsReconnect}
  <TgParagraph>
    You have been disconnected due to inactivity. To keep using the room you can
  </TgParagraph>
  <TgButton type="primary" on:click={connectWebSocket}>Reconnect</TgButton>
{:else}
  <RoomHeader
    {url}
    isHost={webSocket?.hostKey !== undefined}
    on:click-delete={handleDeleteRoom}
  />
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
        <TgHeadingSub>Your vote:</TgHeadingSub>
        <VoteControls {roomData} {currentUser} on:vote={handleVote} />
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
        <NewUserForm on:submit={handleNewUser} />
      {/if}
    </section>
  {/if}
{/if}
