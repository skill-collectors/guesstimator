<script lang="ts">
  import QRCode from "qrcode";
  import { onMount } from "svelte";

  export let data = "";

  let canvas: HTMLCanvasElement;

  onMount(() => {
    QRCode.toCanvas(canvas, data, (error) => {
      if (error) {
        console.log(error);
      }
    });
  });
</script>

<canvas bind:this={canvas} />
