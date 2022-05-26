<script>
	import "virtual:windi.css"

	// if you want to enable windi devtools
	import { browser } from "$app/env";
	// @ts-ignore See https://github.com/windicss/vite-plugin-windicss/issues/294
	if (browser) import("virtual:windi-devtools")
</script>
<div class="h-full flex flex-col">
	<header>Header</header>
	<main class="flex-grow">
		<slot></slot>
	</main>
	<footer>Footer</footer>
</div>
