<script lang="ts">
	import { Confetti } from 'svelte-confetti';
</script>

<div class="pointer-events-none fixed top-2/4 left-2/4 h-screen w-screen">
	<Confetti x={[-5, 5]} y={[-5, 5]} amount={800} duration={4000} fallDistance="100vh" />
</div>
