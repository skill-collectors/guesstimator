<script>
  export let username = "";
  export let isRevealed = false;
  export let hasValue = false;
  export let value = "";

  let displayValue = value == "" ? "?" : value;
</script>

{#if isRevealed}
  <div class="inline-block">
    <div
      class="flex flex-col items-center justify-center w-36 h-56 p-2 m-2 font-bold bg-teal-50 rounded-lg border-4 border-teal-600 text-teal-700"
    >
      <div class="text-6xl">{displayValue}</div>
      <div>{username}</div>
    </div>
  </div>
{:else}
  <div class="inline-block">
    <div
      class="flex flex-col items-center justify-center w-36 h-56 p-2 m-2 font-bold bg-teal-700 rounded-lg border-5 border-teal-900 text-teal-50"
    >
      <div class="text-6xl text-lime-400">
        {#if hasValue}
          !
        {:else}
          &nbsp;
        {/if}
      </div>
      <div>{username}</div>
    </div>
  </div>
{/if}
