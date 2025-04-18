<script lang="ts">
	import TgButton from '$lib/components/base/TgButton.svelte';
	import CopyIcon from '$lib/components/icons/CopyIcon.svelte';
	import ShareIcon from '$lib/components/icons/ShareIcon.svelte';
	import QrCodeIcon from '$lib/components/icons/QrCodeIcon.svelte';
	import QrCode from '$lib/components/QrCode.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import TgHeadingSub from '$lib/components/base/TgHeadingSub.svelte';
	import TgParagraph from '$lib/components/base/TgParagraph.svelte';

	interface Props {
		url: URL;
	}

	let { url }: Props = $props();

	const shareData = {
		title: 'Join my Guesstimator room',
		text: 'Click to help us size some agile stories',
		url: url.toString(),
	};

	const canShare = navigator.canShare === undefined ? false : navigator.canShare();

	let copyConfirmationText: string | null = $state(null);
	let showingQrCode = $state(false);

	function handleShareRoom() {
		if (canShare) {
			navigator.share(shareData);
		}
	}

	function displayCopyMessage(message: string) {
		copyConfirmationText = message;
		window.setTimeout(() => {
			copyConfirmationText = null;
		}, 2000);
	}

	async function handleCopyClick() {
		try {
			await navigator.clipboard.writeText(url.href);
			displayCopyMessage('Copied!');
		} catch {
			displayCopyMessage('Failed!');
		}
	}

	function handleQrCodeButtonClick() {
		showingQrCode = true;
	}
</script>

<header class="mt-8">
	Room URL: <span class="whitespace-nowrap">{url}</span>
	<span class="whitespace-nowrap">
		<TgButton id="copyUrlButton" type="secondary" onclick={handleCopyClick} class="relative">
			<CopyIcon />
			{#if copyConfirmationText !== null}
				<div
					class="animate-fade-up animate-duration-1000 absolute -top-4
        -left-2 z-10
        border-2 border-slate-900 bg-slate-100 text-slate-900"
				>
					{copyConfirmationText}
				</div>
			{/if}
		</TgButton>
		<TgButton id="qrCodeButton" type="secondary" onclick={handleQrCodeButtonClick} class="relative">
			<QrCodeIcon />
		</TgButton>
	</span>
	<Modal bind:showModal={showingQrCode}>
		<TgHeadingSub>{url.href}</TgHeadingSub>
		<div class="flex justify-center">
			<QrCode data={url.href} />
		</div>
		<TgParagraph>Scan the QR code above with your phone's camera to join from your mobile device.</TgParagraph>
	</Modal>
	{#if canShare}
		<TgButton id="shareRoomButton" type="secondary" onclick={handleShareRoom}>
			<ShareIcon />
		</TgButton>
	{/if}
</header>
