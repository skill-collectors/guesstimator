<script lang="ts">
  export let name: string | null | undefined = undefined;
  export let value = "";
  export let maxlength: number | null | undefined = undefined;
  export let testId: string | null | undefined = undefined;
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<input
  type="text"
  {name}
  {maxlength}
  data-testid={testId}
  bind:value
  class={`rounded border border-gray-400 pl-1 ${additionalClasses}`}
/>
