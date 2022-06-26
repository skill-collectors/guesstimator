<script>
  import Button from "./components/base/Button.svelte";
  import ButtonType from "./components/base/ButtonType";
  import Heading from "./components/base/Heading.svelte";
  import Link from "./components/base/Link.svelte";
  import Paragraph from "./components/base/Paragraph.svelte";
</script>

<section>
  {#each [1, 2, 3, 4, 5, 6] as level}
    <Heading {level}>Heading {level}</Heading>
  {/each}
  <Paragraph>
    Visit a <Link href="example.com">Link</Link>
  </Paragraph>
  <form>
    <Button type={ButtonType.Primary}>Primary</Button>
    <Button type={ButtonType.Secondary}>Secondary</Button>
    <Button type={ButtonType.Danger}>Danger</Button>
  </form>
</section>
