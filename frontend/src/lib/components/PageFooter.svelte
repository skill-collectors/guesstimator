<script>
	import TgLink from './base/TgLink.svelte';

	const mode = import.meta.env.MODE;
</script>

<footer class="p-3 text-center">
	<TgLink href="/">home</TgLink>
	|
	<TgLink href="https://github.com/skill-collectors/guesstimator" target="_blank">source code</TgLink>
	(AGPL) |
	<TgLink href="https://skill-collectors.github.io/guesstimator" target="_blank">dev docs |</TgLink>
	<TgLink
		href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
		target="_blank"
	>
		report a bug |
	</TgLink>
	<TgLink
		href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=enhancement&template=feature_request.md&title="
		target="_blank"
	>
		feature request
	</TgLink>
	{#if mode !== 'production'}
		| {mode}
	{/if}
</footer>
