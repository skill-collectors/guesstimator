<script lang="ts">
  import "../app.css";
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

<style>
</style>
