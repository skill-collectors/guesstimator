<script lang="ts">
	import TgButton from '$lib/components/base/TgButton.svelte';
	import type { Room, User } from '$lib/services/rooms';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		roomData: Room;
		currentUser: User;
	}

	let { roomData, currentUser }: Props = $props();

	const dispatch = createEventDispatcher();

	function handleVote(vote = '') {
		dispatch('vote', { vote });
	}
</script>

{#each roomData.validSizes as vote}
	{#if vote === currentUser.vote}
		<TgButton type="primary" class="m-2" onclick={() => handleVote()}>{vote}</TgButton>
	{:else}
		<TgButton type="secondary" class="m-2" onclick={() => handleVote(vote)}>{vote}</TgButton>
	{/if}
{/each}
<TgButton type="danger" class="m-2" onclick={() => handleVote()}>Clear</TgButton>
