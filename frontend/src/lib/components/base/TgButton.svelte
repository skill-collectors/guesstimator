<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  interface Props {
    type: "primary" | "secondary" | "danger" | "success";
    href?: string | undefined;
    id?: string | undefined;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let {
    type,
    href = undefined,
    id = undefined,
    class: additionalClasses = "",
    children
  }: Props = $props();
  
</script>

{#if href === undefined}
  {#if type === "primary"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-blue-900 text-blue-50 ${additionalClasses}`}
      onclick={bubble('click')}>{@render children?.()}</button
    >
  {/if}
  {#if type === "secondary"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-slate-800 text-slate-50 ${additionalClasses}`}
      onclick={bubble('click')}>{@render children?.()}</button
    >
  {/if}
  {#if type === "danger"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-orange-800 text-orange-50 ${additionalClasses}`}
      onclick={bubble('click')}>{@render children?.()}</button
    >
  {/if}
  {#if type === "success"}
    <button
      {id}
      class={`rounded font-semibold p-2 bg-lime-800 text-lime-50 ${additionalClasses}`}
      onclick={bubble('click')}>{@render children?.()}</button
    >
  {/if}
{:else}
  {#if type === "primary"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-blue-900 text-blue-50 ${additionalClasses}`}
      >{@render children?.()}</a
    >
  {/if}
  {#if type === "secondary"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-slate-800 text-slate-50 ${additionalClasses}`}
      >{@render children?.()}</a
    >
  {/if}
  {#if type === "danger"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-orange-800 text-orange-50 ${additionalClasses}`}
      >{@render children?.()}</a
    >
  {/if}
  {#if type === "success"}
    <a
      {id}
      {href}
      class={`rounded font-semibold p-2 bg-lime-800 text-lime-50 ${additionalClasses}`}
      >{@render children?.()}</a
    >
  {/if}
{/if}
