<script type="ts">
  let type: "primary" | "secondary" | "danger" | "success";
</script>

{#if type === "primary"}
  <button class="rounded font-semibold p-2 bg-blue-900 text-blue-50"
    ><slot /></button
  >
{/if}
{#if type === "secondary"}
  <button class="rounded font-semibold p-2 bg-slate-800 text-slate-50"
    ><slot /></button
  >
{/if}
{#if type === "danger"}
  <button class="rounded font-semibold p-2 bg-orange-800 text-orange-50"
    ><slot /></button
  >
{/if}
{#if type === "success"}
  <button class="rounded font-semibold p-2 bg-lime-800 text-lime-50"
    ><slot /></button
  >
{/if}
