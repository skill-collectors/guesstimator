<script type="ts">
  import "virtual:windi.css";

  // if you want to enable windi devtools
  import { browser } from "$app/environment";

  // @ts-ignore: See https://github.com/windicss/vite-plugin-windicss/issues/294
  if (browser) import("virtual:windi-devtools");

  import PageMain from "$lib/components/PageMain.svelte";
  import PageFooter from "$lib/components/PageFooter.svelte";
  import { onMount } from "svelte";
  import {
    NotFoundError,
    ServerErrorWithId,
    ServerOverLoadedError,
    UnknownServerError,
  } from "$lib/services/rest";

  onMount(() => {
    window.onunhandledrejection = (e) => {
      const err = e.reason;
      console.log(err);
      if (err instanceof NotFoundError) {
        window.location.href = "/errors/notfound";
      } else if (err instanceof ServerOverLoadedError) {
        window.location.href = "/errors/overload";
      } else if (err instanceof ServerErrorWithId) {
        const serverErrorWithId = err as ServerErrorWithId;
        window.location.href = `/errors/server?timestamp=${serverErrorWithId.timestamp}&errorId=${serverErrorWithId.errorId}`;
      } else if (err instanceof UnknownServerError) {
        window.location.href = "/errors/server";
      } else {
        window.location.href = "/errors/client";
      }
    };
  });
</script>

<div class="h-full flex flex-col text-center">
  <PageMain class="flex-grow"><slot /></PageMain>
  <PageFooter />
</div>

<style windi:global windi:preflights:global windi:safelist:global>
</style>
