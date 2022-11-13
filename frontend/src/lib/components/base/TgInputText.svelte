<script type="ts">
  export let name: string;
  export let value: string;
  let additionalClasses = "";
  export { additionalClasses as class };
</script>

<input
  type="text"
  {name}
  {value}
  class={`rounded border border-gray-400 pl-1 ${additionalClasses}`}
/>
