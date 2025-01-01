<script lang="ts">
	import { run } from 'svelte/legacy';

	interface Props {
		username?: string;
		isRevealed?: boolean;
		hasValue?: boolean;
		value?: string;
	}

	let { username = '', isRevealed = false, hasValue = false, value = '' }: Props = $props();

	let delay = $state(0);
	let animationDelayClassName = $state('');
	run(() => {
		if (isRevealed === true) {
			// Set a random delay for each reveal
			// This makes it feel more natural vs all cards flipping in perfect synchrony.
			delay = Math.floor(Math.random() * 5) + 1;
			switch (delay) {
				// Tailwind CSS will only include classes that are fully specified (without variable interpolation),
				// so we have to return the full class name here.
				case 1:
					animationDelayClassName = 'animate-delay-100';
					break;
				case 2:
					animationDelayClassName = 'animate-delay-200';
					break;
				case 3:
					animationDelayClassName = 'animate-delay-300';
					break;
				case 4:
					animationDelayClassName = 'animate-delay-400';
					break;
				case 5:
					animationDelayClassName = 'animate-delay-500';
					break;
			}
		}
	});

	let displayValue = $derived(value === '' ? '?' : value);
</script>

<!-- Playing cards are 2.5 x 3.5 inches, or 1.4x taller than wide -->
<div class="animate-fade-up" data-testid="{username}-card">
	{#if isRevealed}
		<div
			class="
      animate-rotate-y {animationDelayClassName}
      shadow-dark-100 m-2
      flex h-40 w-28 flex-col
      items-center justify-center rounded-lg border-4
      border-teal-600 bg-teal-50
      p-2
      font-bold text-teal-700 shadow-lg sm:h-52 sm:w-36
      "
		>
			<div class="text-5xl sm:text-6xl">{displayValue}</div>
			<div class="overflow-hidden break-words [word-break:break-word]">
				{username}
			</div>
		</div>
	{:else if hasValue}
		<div
			class="
      shadow-dark-100 m-2
      flex h-40 w-28 flex-col
      items-center justify-center rounded-lg border-4
      border-teal-900 bg-teal-700
      p-2
      font-bold text-teal-50
      shadow-lg sm:h-52 sm:w-36
      "
		>
			<div class="text-3xl text-teal-200 sm:text-6xl">!</div>
			<div class="overflow-hidden break-words [word-break:break-word]">
				{username}
			</div>
		</div>
	{:else}
		<div
			class="
      shadow-dark-100 m-2
      flex h-40 w-28 flex-col
      items-center justify-center rounded-lg border-4
      border-teal-900 bg-teal-700
      p-2
      font-bold text-teal-50
      shadow-lg sm:h-52 sm:w-36
      "
		>
			<div class="text-3xl text-teal-200 sm:text-6xl">&nbsp;</div>
			<div class="overflow-hidden break-words [word-break:break-word]">
				{username}
			</div>
		</div>
	{/if}
</div>
