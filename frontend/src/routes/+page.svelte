<script>
  async function createNewRoom() {
    console.log("click!");
    const response = await fetch(
      "https://agile-poker-api-dev.superfun.link/rooms/new"
    );
    if (response.ok) {
      console.log(await response.json());
    } else {
      console.log(await response.text());
    }
  }
</script>

<div class="text-center">
  <p class="paragraph mb-3">
    This is an app for "pointing" agile stories. To get started
  </p>
  <button on:click={createNewRoom} class="btn btn-primary">Create a room</button
  >
</div>
