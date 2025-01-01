<script>
	import TgHeadingMain from '$lib/components/base/TgHeadingMain.svelte';
	import TgLink from '$lib/components/base/TgLink.svelte';
	import TgParagraph from '$lib/components/base/TgParagraph.svelte';
</script>

<TgHeadingMain>Couldn't find that room</TgHeadingMain>
<TgParagraph>
	The room you tried to go to doesn't exist. The URL may be incorrect, or the room may have been deleted if it
	hasn't been used in a while. You can always
	<TgLink href="/rooms">create a new room.</TgLink>
	If you're sure the room should exist, you can also
	<TgLink
		href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
		>create a bug report.
	</TgLink>
</TgParagraph>
