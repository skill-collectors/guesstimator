<script>
  export let username = "";
  export let isRevealed = false;
  export let hasValue = false;
  export let value = "";

  $: displayValue = value === "" ? "?" : value;
</script>

<div class="inline-block animate-animated animate-fade-in">
  {#if isRevealed}
    <div
      class="animate-animated animate-flip-in-y shadow-dark-100 shadow-lg flex flex-col items-center justify-center w-18 h-28 md:w-36 md:h-56 p-2 m-2 font-bold bg-teal-50 rounded-lg border-4 border-teal-600 text-teal-700"
    >
      <div class="text-3xl md:text-6xl">{displayValue}</div>
      <div>{username}</div>
    </div>
  {:else if hasValue}
    <div
      class="animate-animated animate-infinite animate-pulse shadow-dark-100 shadow-lg flex flex-col items-center justify-center w-18 h-28 md:w-36 md:h-56 p-2 m-2 font-bold bg-teal-700 rounded-lg border-5 border-teal-900 text-teal-50"
    >
      <div class="text-3xl md:text-6xl text-teal-200">!</div>
      <div>{username}</div>
    </div>
  {:else}
    <div
      class="shadow-dark-100 shadow-lg flex flex-col items-center justify-center w-18 h-28 md:w-36 md:h-56 p-2 m-2 font-bold bg-teal-700 rounded-lg border-5 border-teal-900 text-teal-50"
    >
      <div class="text-3xl md:text-6xl text-teal-200">&nbsp;</div>
      <div>{username}</div>
    </div>
  {/if}
</div>
