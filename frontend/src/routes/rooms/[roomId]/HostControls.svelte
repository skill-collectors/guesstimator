<script lang="ts">
	import TgButton from '$lib/components/base/TgButton.svelte';
	import TgParagraph from '$lib/components/base/TgParagraph.svelte';
	import Loader from '$lib/components/icons/Loader.svelte';
	import type { Room } from '$lib/services/rooms';

	interface Props {
		roomData: Room;
		reveal: () => void;
		reset: () => void;
	}

	let { roomData, reveal, reset }: Props = $props();

	let isPending = $state(false);
	// Reset isPending whenever isRevealed changes
	$effect(() => {
		if (roomData.isRevealed !== undefined) {
			isPending = false;
		}
	});

	let joinedUsers = $derived(roomData.users.filter((user) => user.username.length > 0));

	let isEveryoneReady = $derived(joinedUsers.every((user) => user.hasVote));

	function handleReveal() {
		isPending = true;
		reveal();
	}

	function handleReset() {
		isPending = true;
		reset();
	}
</script>

<TgParagraph>
	{#if isPending === true}
		<Loader />
	{:else if roomData.isRevealed}
		<TgButton id="hideCardsButton" type="secondary" onclick={handleReset}>Reset</TgButton>
	{:else if joinedUsers.length === 0}
		<TgParagraph>Waiting for people to join...</TgParagraph>
	{:else if isEveryoneReady}
		<TgButton id="showCardsButton" type="success" onclick={handleReveal}>Reveal cards</TgButton>
	{:else}
		<TgButton id="showCardsButton" type="secondary" onclick={handleReveal}>Reveal cards</TgButton>
	{/if}
</TgParagraph>
