<script lang="ts">
  import QRCode from "qrcode";
  import { onMount } from "svelte";

  interface Props {
    data?: string;
  }

  let { data = "" }: Props = $props();

  let canvas: HTMLCanvasElement = $state();

  onMount(() => {
    QRCode.toCanvas(canvas, data, (error) => {
      if (error) {
        console.log(error);
      }
    });
  });
</script>

<canvas bind:this={canvas}></canvas>
