<script lang="ts">
  import "virtual:windi.css";

  // if you want to enable windi devtools
  import { browser } from "$app/environment";

  // @ts-ignore: See https://github.com/windicss/vite-plugin-windicss/issues/294
  if (browser) import("virtual:windi-devtools");

  import PageMain from "$lib/components/PageMain.svelte";
  import PageFooter from "$lib/components/PageFooter.svelte";
  import { onMount } from "svelte";
  import { redirectToErrorPage } from "$lib/services/errorHandler";

  onMount(() => {
    window.onunhandledrejection = (e) => {
      const err = e.reason;
      redirectToErrorPage(err);
    };
  });
</script>

<div class="h-full flex flex-col text-center">
  <PageMain class="flex-grow"><slot /></PageMain>
  <PageFooter />
</div>

<style windi:global windi:preflights:global windi:safelist:global>
</style>
