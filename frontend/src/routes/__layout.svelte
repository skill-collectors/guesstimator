<script>
  import "virtual:windi.css"

  // if you want to enable windi devtools
  import { browser } from "$app/env";
  if (browser) import("virtual:windi-devtools")

	import Header from '$lib/Header.svelte'
</script>
<div class="h-full flex flex-col">
	<Header></Header>
	<main class="flex-grow">
		<slot></slot>
	</main>
	<footer>Footer</footer>
</div>
