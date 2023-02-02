<script lang="ts">
  export let type: "primary" | "secondary" | "danger" | "success";
  export let href: string | undefined = undefined;
  export let id: string | undefined = undefined;
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

{#if href === undefined}
  {#if type === "primary"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-blue-900 text-blue-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
  {#if type === "secondary"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-slate-800 text-slate-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
  {#if type === "danger"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-orange-800 text-orange-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
  {#if type === "success"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-lime-800 text-lime-50 ${additionalClasses}`}
      on:click><slot /></button
    >
  {/if}
{:else}
  {#if type === "primary"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-blue-900 text-blue-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
  {#if type === "secondary"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-slate-800 text-slate-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
  {#if type === "danger"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-orange-800 text-orange-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
  {#if type === "success"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-lime-800 text-lime-50 ${additionalClasses}`}
      ><slot /></a
    >
  {/if}
{/if}
