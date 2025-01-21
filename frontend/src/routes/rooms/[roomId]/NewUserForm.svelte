<script lang="ts">
	import TgButton from '$lib/components/base/TgButton.svelte';
	import TgInputText from '$lib/components/base/TgInputText.svelte';

	let { submit } = $props();

	let username = $state('');

	function onsubmit() {
		if (username.length > 0) {
			submit({ username });
		}
	}
</script>

<form {onsubmit}>
	<TgInputText name="newUser" maxlength={30} bind:value={username} />
	<TgButton type="primary" class="m-2" onclick={onsubmit}>Join room</TgButton>
</form>
