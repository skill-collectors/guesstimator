<script type="ts">
  export let level: number;
</script>

{#if level === 1}
  <h1 class="ap-heading text-6xl"><slot /></h1>
{:else if level === 2}
  <h2 class="ap-heading text-5xl"><slot /></h2>
{:else if level === 3}
  <h2 class="ap-heading text-4xl"><slot /></h2>
{:else if level === 4}
  <h2 class="ap-heading text-3xl"><slot /></h2>
{:else if level === 5}
  <h2 class="ap-heading text-2xl"><slot /></h2>
{:else if level === 1}
  <h2 class="ap-heading text-1xl"><slot /></h2>
{/if}
