<script lang="ts">
  import Card from "$lib/components/card.svelte";

  const cards = [
    {
      name: "Characters",
      description:
        "View and edit your characters, or create new ones to use in campaigns",
      link: "/characters",
    },
    {
      name: "Campaign",
      description:
        "Explore and enter all the campaigns you have been invited to or created",
      link: "/campaign",
    },
  ];
</script>

<div class="cards">
  {#each cards as data}
    <Card link={data.link}>
      <h3 class="w3-center w3-padding-32 w3-border-bottom">{data.name}</h3>
      <p class="w3-padding-32">{data.description}</p>
    </Card>
  {/each}
</div>

<style>
  h3 {
    margin: 0;
  }
  p {
    line-height: 1.5em;
  }
</style>