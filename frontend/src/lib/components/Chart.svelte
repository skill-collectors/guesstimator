<script lang="ts">
	import 'chartist/dist/index.css';
	import { BarChart } from 'chartist';
	import type { BarChartData, BarChartOptions, Label, AllSeriesTypes } from 'chartist';

	let { labels = [], series = [], class: className = '', options = {} }: Props = $props();

	const data: BarChartData = {
		labels,
		series,
	};

	interface Props {
		labels?: Label[];
		series?: AllSeriesTypes;
		class?: string;
		options?: BarChartOptions;
	}

	let chartContainer = $state<HTMLElement | undefined>(undefined);

	$effect(() => {
		if (chartContainer !== undefined) {
			new BarChart(chartContainer, data, options);
		}
	});
</script>

<div class={className} bind:this={chartContainer}></div>
