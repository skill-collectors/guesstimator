<script lang="ts">
	import { run } from 'svelte/legacy';

	import { page } from '$app/stores';
	import TgButton from '$lib/components/base/TgButton.svelte';
	import TgHeadingSub from '$lib/components/base/TgHeadingSub.svelte';
	import TgParagraph from '$lib/components/base/TgParagraph.svelte';
	import * as localStorage from '$lib/services/localStorage';
	import { GuesstimatorWebSocket } from '$lib/services/websockets';
	import type { Room, User } from '$lib/services/rooms';
	import * as rooms from '$lib/services/rooms';
	import InvalidRoom from './InvalidRoom.svelte';
	import { onDestroy, onMount } from 'svelte';
	import Loader from '$lib/components/icons/Loader.svelte';
	import RoomHeader from './RoomHeader.svelte';
	import HostControls from './HostControls.svelte';
	import CardGroup from './CardGroup.svelte';
	import ResultsChart from './ResultsChart.svelte';
	import VoteControls from './VoteControls.svelte';
	import NewUserForm from './NewUserForm.svelte';
	import BottomHostControls from './BottomHostControls.svelte';
	import { Operation, PendingOperation } from './PendingOperation';

	let notFound = $state(false);
	const roomId = $page.params.roomId;
	const url = $page.url;

	let clearReloadInterval: number;
	let pingTimeout: number | undefined = undefined;

	let webSocket: GuesstimatorWebSocket | undefined = $state();
	let webSocketNeedsReconnect = $state(false);
	let roomData = $state<Room | null>(null);

	let loadingStatus = $state('');

	let pendingOperation = $state(new PendingOperation(Operation.NOOP));

	let currentUser = $derived(roomData?.users?.find((user: User) => user.userKey !== undefined));
	let isJoined = $derived(currentUser === undefined || currentUser.username.length === 0);
	let isHost = $derived(webSocket?.hostKey !== undefined);

	run(() => {
		if (currentUser?.userKey !== undefined && webSocket !== undefined) {
			webSocket.userKey = currentUser.userKey;

			const existingUserData = localStorage.getUserData(roomId);
			if (
				existingUserData !== undefined &&
				existingUserData.username !== undefined &&
				existingUserData.username !== '' &&
				currentUser?.username === ''
			) {
				console.log('Current user got kicked. Rejoining...');
				pendingOperation = new PendingOperation(Operation.JOIN, '', existingUserData.username);
				if (currentUser) {
					currentUser.username = existingUserData.username;
				}
				webSocket?.join(existingUserData.username);
			} else {
				localStorage.storeUserData(roomId, currentUser.userKey, currentUser.username);
			}
		}
	});

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
		loadingStatus = 'Connecting to room...';
		webSocket = new GuesstimatorWebSocket(
			roomId,
			onWebSocketMessage,
			onWebSocketError,
			onWebSocketOpen,
			onWebSocketClose,
			userKey,
			hostKey,
		);
	}

	function onWebSocketOpen(this: WebSocket) {
		loadingStatus = 'Subscribing to updates...';
		webSocket?.subscribe();
	}

	function onWebSocketMessage(this: WebSocket, event: MessageEvent) {
		loadingStatus = '';

		if (webSocket === undefined) {
			// It would be really weird if this happend.
			console.error('Got a message, but the websocket is gone.');
			return;
		}
		const json = event.data;
		if (json !== undefined && typeof json === 'string' && json.length > 0) {
			const message = JSON.parse(json);

			if (message?.data?.type === 'PONG') {
				window.clearTimeout(pingTimeout);
				console.log('<< PONG!');
			} else {
				console.debug('Got message: ', message);
				if (message.status !== 200) {
					console.error(message);
					if (message.status === 404) {
						notFound = true;
					}
				} else if (rooms.isRoom(message.data)) {
					if (
						!roomData ||
						!roomData.timestamp ||
						!message.data.timestamp ||
						message.data.timestamp > roomData.timestamp
					) {
						roomData = message.data;
						roomData = pendingOperation.apply(roomData);
					} else {
						console.log(`Ignoring old room data: ${message.data.timestamp} < ${roomData.timestamp}`);
					}
				} else {
					console.error('Could not handle message', message);
				}
			}
		} else if (json === undefined) {
			console.error('No data on event', event);
		}
	}

	function onWebSocketError(this: WebSocket, event: Event) {
		console.error('WebSocket error', event);
		pendingOperation = new PendingOperation(Operation.NOOP);
	}

	function onWebSocketClose(this: WebSocket, event: Event) {
		console.log('WebSocket closed', event);
		pendingOperation = new PendingOperation(Operation.NOOP);
		if (document.hidden) {
			webSocketNeedsReconnect = true;
		} else {
			connectWebSocket();
		}
	}

	function handleNewUser(e: { username: string }) {
		pendingOperation = new PendingOperation(Operation.JOIN, '', e.username);
		if (currentUser) {
			currentUser.username = e.username;
		}
		webSocket?.join(e.username);
	}

	function handleVote(e: { vote: string }) {
		if (currentUser !== undefined) {
			pendingOperation = new PendingOperation(Operation.VOTE, currentUser.vote, e.vote);
			currentUser.vote = e.vote;
			webSocket?.vote(e.vote);
		}
	}

	function handleLeave() {
		if (currentUser !== undefined) {
			pendingOperation = new PendingOperation(Operation.LEAVE, currentUser.username, '');
			currentUser.username = '';
			localStorage.storeUserData(roomId, currentUser.userKey);
			webSocket?.leave();
		}
	}

	function handleReveal() {
		webSocket?.reveal();
	}

	function handleReset() {
		webSocket?.reset();
	}

	async function handleNewSizes(e: CustomEvent<{ newSizes: string }>) {
		webSocket?.setValidSizes(e.detail.newSizes);
	}

	async function handleDeleteRoom() {
		if (roomData === null) {
			return;
		}
		if (!isHost) {
			return;
		}
		if (webSocket && webSocket.hostKey) {
			await rooms.deleteRoom(roomData.roomId, webSocket.hostKey);
			localStorage.deleteHostKey(roomData.roomId);
			window.location.href = '/';
		}
	}

	function ping() {
		webSocket?.ping();
		pingTimeout = window.setTimeout(() => {
			console.warn('PING timed out. Reconnecting...');
			connectWebSocket();
		}, 5_000); // Wait 5 seconds before reconnecting
	}

	function handleVisibilityChange() {
		if (document.hidden) {
			window.clearTimeout(pingTimeout);
			window.clearInterval(clearReloadInterval);
		} else {
			if (webSocketNeedsReconnect) {
				connectWebSocket();
			} else {
				if (roomData !== null) {
					ping();
				}
				clearReloadInterval = window.setInterval(() => {
					ping();
				}, 60_000); // every minute
			}
		}
	}
	onMount(() => {
		handleVisibilityChange();
	});
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} />
<svelte:head>
	<title>Guesstimator - {roomData?.roomId ?? 'New'}</title>
	<meta name="description" content={`Page for room ${roomData?.roomId}`} />
</svelte:head>
{#if notFound}
	<InvalidRoom />
{:else if roomData === null}
	<TgParagraph>{loadingStatus}</TgParagraph>
	<Loader />
{:else if webSocketNeedsReconnect}
	<TgParagraph>You have been disconnected due to inactivity. To keep using the room you can</TgParagraph>
	<TgButton type="primary" onclick={connectWebSocket}>Reconnect</TgButton>
{:else}
	<RoomHeader {url} />
	<section id="currentVotes" class="mt-8">
		<TgHeadingSub>Current votes:</TgHeadingSub>
		{#if isHost}
			<HostControls {roomData} on:reset={handleReset} on:reveal={handleReveal} />
		{/if}
		<div class="mb-6">
			<CardGroup {roomData} />
		</div>
	</section>
	{#if roomData?.isRevealed}
		<section id="resultsChart" class="mx-auto max-w-xl">
			<ResultsChart {roomData} />
		</section>
	{/if}
	<section id="userControls" class="sm:mt-32">
		{#if isJoined}
			<TgParagraph>If you'd like to vote, enter a name and join the room:</TgParagraph>
			<NewUserForm submit={handleNewUser} />
		{:else if currentUser}
			{#if roomData?.isRevealed === true}
				<TgHeadingSub>Your vote: {currentUser.vote}</TgHeadingSub>
			{:else}
				<TgHeadingSub>Your vote: {currentUser.vote}</TgHeadingSub>
				<VoteControls {roomData} {currentUser} vote={handleVote} />
			{/if}
			<TgParagraph>
				You are joined as <strong>{currentUser.username}</strong>
				<TgButton type="danger" class="m-2" onclick={handleLeave}>Leave</TgButton>
			</TgParagraph>
		{/if}
	</section>
	{#if isHost}
		<BottomHostControls {roomData} on:newSizes={handleNewSizes} on:deleteRoom={handleDeleteRoom} />
	{/if}
{/if}
