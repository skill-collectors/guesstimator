<script type="ts">
  export let type: "primary" | "secondary" | "danger" | "success";
  export let href: string | undefined;
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

{#if href === undefined}
  {#if type === "primary"}
    <button
      class={`rounded font-semibold p-2 bg-blue-900 text-blue-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
  {#if type === "secondary"}
    <button
      class={`rounded font-semibold p-2 bg-slate-800 text-slate-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
  {#if type === "danger"}
    <button
      class={`rounded font-semibold p-2 bg-orange-800 text-orange-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
  {#if type === "success"}
    <button
      class={`rounded font-semibold p-2 bg-lime-800 text-lime-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
{:else}
  {#if type === "primary"}
    <a
      {href}
      class={`rounded font-semibold p-2 bg-blue-900 text-blue-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
  {#if type === "secondary"}
    <a
      {href}
      class={`rounded font-semibold p-2 bg-slate-800 text-slate-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
  {#if type === "danger"}
    <a
      {href}
      class={`rounded font-semibold p-2 bg-orange-800 text-orange-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
  {#if type === "success"}
    <a
      {href}
      class={`rounded font-semibold p-2 bg-lime-800 text-lime-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
{/if}
