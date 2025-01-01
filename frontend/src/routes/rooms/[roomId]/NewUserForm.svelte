<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import TgButton from '$lib/components/base/TgButton.svelte';
	import TgInputText from '$lib/components/base/TgInputText.svelte';
	import { createEventDispatcher } from 'svelte';

	let username = $state('');

	const dispatch = createEventDispatcher();
	function handleSubmit() {
		if (username.length > 0) {
			dispatch('submit', { username });
		}
	}
</script>

<form onsubmit={preventDefault(handleSubmit)}>
	<TgInputText name="newUser" maxlength={30} bind:value={username} />
	<TgButton type="primary" class="m-2" onclick={handleSubmit}>Join room</TgButton>
</form>
