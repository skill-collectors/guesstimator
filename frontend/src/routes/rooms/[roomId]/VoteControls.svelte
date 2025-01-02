<script lang="ts">
	import TgButton from '$lib/components/base/TgButton.svelte';
	import type { Room, User } from '$lib/services/rooms';

	interface Props {
		roomData: Room;
		currentUser: User;
		vote: (args: { vote: string }) => void;
	}

	let { roomData, currentUser, vote }: Props = $props();

	function handleVote(voteValue = '') {
		vote({ vote: voteValue });
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
