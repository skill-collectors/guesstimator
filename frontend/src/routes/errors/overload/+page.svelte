<script>
  import TgHeadingMain from "$lib/components/base/TgHeadingMain.svelte";
  import TgLink from "$lib/components/base/TgLink.svelte";
  import TgParagraph from "$lib/components/base/TgParagraph.svelte";
</script>

<svelte:head>
  <title>Guesstimator - Error</title>
  <meta name="description" content="Server overloaded error page" />
</svelte:head>
<TgHeadingMain>The application is overloaded</TgHeadingMain>
<TgParagraph>
  In order to control costs, the application limits requests per second and per
  month. It appears that those limits have been exceeded. Please wait a few
  minutes and try again. You can also
  <TgLink
    href="https://github.com/skill-collectors/guesstimator/discussions/new"
    >start a discussion
  </TgLink>
  about additional funding options if you'd like.
</TgParagraph>
