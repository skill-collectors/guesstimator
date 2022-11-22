<script type="ts">
  export let name: string;
  export let value: string;
  export let maxlength: number;
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<input
  type="text"
  {name}
  {maxlength}
  bind:value
  class={`rounded border border-gray-400 pl-1 ${additionalClasses}`}
/>
