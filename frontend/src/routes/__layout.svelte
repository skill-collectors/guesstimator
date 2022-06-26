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

<style windi:global windi:preflights:global windi:safelist:global>
</style>
