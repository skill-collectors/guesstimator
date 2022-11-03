<script>
  import { page } from "$app/stores";
  console.log(`${$page.status}: ${$page.error?.message}`);
</script>

<h1 class="h-main">
  The application was not able to complete the requested action
</h1>
<p>
  We could not complete the last operation due to a problem on our end. Please
  try again, or if the issue keeps happening you can
  <a
    class="link"
    href="https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=bug&template=bug_report.md&title="
    >create a bug report.</a
  >
</p>
