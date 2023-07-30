<script lang="ts">
  import { Confetti } from "svelte-confetti";
</script>

<div class="fixed top-2/4 left-2/4 h-screen w-screen pointer-events-none">
  <Confetti
    x={[-5, 5]}
    y={[-5, 5]}
    amount={800}
    duration={4000}
    fallDistance="100vh"
  />
</div>
