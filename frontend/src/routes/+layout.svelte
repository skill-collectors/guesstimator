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
    ApiEndpointNotFoundError,
    ApiErrorWithId,
    ApiOverloadedError,
    ApiUnknownError,
  } from "$lib/services/rest";

  onMount(() => {
    window.onunhandledrejection = (e) => {
      const err = e.reason;
      console.log(err);
      // These are errors thrown by src/lib/services/rest.ts
      if (err instanceof ApiEndpointNotFoundError) {
        // Invalid routes in the frontend render src/routes/+error.svelte instead.
        window.location.href = "/errors/notfound";
      } else if (err instanceof ApiOverloadedError) {
        // UsagePlan is exhausted
        window.location.href = "/errors/overload";
      } else if (err instanceof ApiErrorWithId) {
        // Error caught and logged in infra/lib/lambda/rest/Main.ts
        const apiErrorWithId = err as ApiErrorWithId;
        window.location.href = `/errors/server?timestamp=${apiErrorWithId.timestamp}&errorId=${apiErrorWithId.errorId}`;
      } else if (err instanceof ApiUnknownError) {
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
