<script type="ts">
  import "virtual:windi.css";

  // if you want to enable windi devtools
  import { browser } from "$app/env";

  // @ts-ignore: See https://github.com/windicss/vite-plugin-windicss/issues/294
  if (browser) import("virtual:windi-devtools");

  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageMain from "$lib/components/PageMain.svelte";
</script>

<div class="h-full flex flex-col">
  <PageHeader />
  <PageMain class="flex-grow"><slot /></PageMain>
</div>

<style global windi:global windi:preflights:global windi:safelist:global>
  /* Eslint has some false positives here that I can't get rid of.
   * These are not 'unused' because of the 'global' directive above,
   * and @apply is definitely working.
   */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-bold font-sans uppercase;
  }
  h1 {
    @apply text-6xl;
  }
  h2 {
    @apply text-5xl;
  }
  h3 {
    @apply text-4xl;
  }
  h4 {
    @apply text-3xl;
  }
  h5 {
    @apply text-2xl;
  }
  h6 {
    @apply text-1xl;
  }
  button {
    @apply rounded font-semibold p-2;
  }

  a {
    @apply text-sky-600 font-medium;
  }

  p {
    @apply mt-2 mb-2;
  }
</style>
