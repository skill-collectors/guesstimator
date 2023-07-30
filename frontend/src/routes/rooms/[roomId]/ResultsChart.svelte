<script lang="ts">
  import Chart from "$lib/components/Chart.svelte";
  import type { Room } from "$lib/services/rooms";
  import UnanimousVoteCelebration from "./UnanimousVoteCelebration.svelte";

  export let roomData: Room;

  let chartLabels: string[] = [];
  let chartDataSeries: number[] = [];

  $: {
    chartLabels = roomData?.validSizes ?? [];
    const currentVotes =
      roomData?.users.filter((user) => user.hasVote).map((user) => user.vote) ??
      [];
    const valueFrequencies = currentVotes?.reduce((map, vote) => {
      map.set(vote, (map.get(vote) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
    chartDataSeries = chartLabels.map(
      (vote) => valueFrequencies.get(vote) ?? 0
    );
  }
</script>

<UnanimousVoteCelebration {roomData} />
<Chart
  labels={chartLabels}
  series={chartDataSeries}
  options={{ distributeSeries: true }}
/>
