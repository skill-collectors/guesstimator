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
  import Loader from "$lib/components/Loader.svelte";
  import Chart from "$lib/components/Chart.svelte";
  import RoomHeader from "./RoomHeader.svelte";
  import SpectatorCounter from "./SpectatorCounter.svelte";
  import HostControls from "./HostControls.svelte";
  import CardGroup from "./CardGroup.svelte";

  let notFound = false;
  const roomId = $page.params.roomId;
  const url = $page.url;

  let currentUser: User | undefined;
  let usernameFieldValue = "";
  let roomData: Room | null = null;

  let webSocket: GuesstimatorWebSocket | undefined;

  let loadingStatus = "";
  let pendingRevealOrReset = false;

  let chartLabels: string[] = [];
  let chartDataSeries: number[] = [];
  $: {
    chartLabels = roomData?.validSizes ?? [];
    const currentVotes =
      roomData?.users.filter((user) => user.hasVote).map((user) => user.vote) ??
      [];
    const valueFrequencies = currentVotes?.reduce((map, vote) => {
      map.set(vote, (map.get(vote) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
    chartDataSeries = chartLabels.map(
      (vote) => valueFrequencies.get(vote) ?? 0
    );
  }

  onMount(() => {
    console.log(chartLabels);
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
    loadingStatus = "";
    console.log(event);
    if (webSocket === undefined) {
      // It would be really weird if this happend.
      console.log("Got a message, but the websocket is gone.");
      // Try reloading the page
      window.location.reload();
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

  function reveal() {
    pendingRevealOrReset = true;
    webSocket?.reveal();
  }

  function reset() {
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
  <section class="mt-8">
    <TgHeadingSub>Current votes:</TgHeadingSub>
    <HostControls
      isHost={webSocket?.hostKey !== undefined}
      {roomData}
      on:reset={reset}
      on:reveal={reveal}
    />
    <div class="mb-6">
      <CardGroup {roomData} />
    </div>
  </section>
  {#if roomData?.isRevealed}
    <Chart
      labels={chartLabels}
      series={chartDataSeries}
      options={{ distributeSeries: true }}
    />
  {:else}
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
