<script>
  import "virtual:windi.css"

  // if you want to enable windi devtools
  import { browser } from "$app/env";
  if (browser) import("virtual:windi-devtools")
</script>
<header>Header</header>
<slot></slot>
<footer>Footer</footer>
