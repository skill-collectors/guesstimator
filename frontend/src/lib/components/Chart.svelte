<script type="ts">
  import "chartist/dist/index.css";
  import { BarChart } from "chartist";
  import type {
    BarChartData,
    BarChartOptions,
    Label,
    AllSeriesTypes,
  } from "chartist";

  export let labels: Label[] = [];
  export let series: AllSeriesTypes = [];

  const data: BarChartData = {
    labels,
    series,
  };

  export let options: BarChartOptions = {};

  let chartContainer: HTMLElement;

  $: {
    if (chartContainer !== undefined) {
      new BarChart(chartContainer, data, options);
    }
  }
</script>

<div bind:this={chartContainer} />
