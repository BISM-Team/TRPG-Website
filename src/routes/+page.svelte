<script lang="ts">
  import Card from "$lib/components/card.svelte";

  const cards = [
    {
      name: "Game Wiki",
      description:
        "A place to find all the informations for a specific Game System, such as DnD or others",
      link: "/GameWiki",
    },
    {
      name: "Campaign",
      description:
        "Explore and enter all the campaigns you have been invited to or created",
      link: "/Campaign",
    },
  ];
</script>

<div class="cards">
  {#each cards as data}
    <Card link={data.link}>
      <h3 class="w3-center w3-padding-16 w3-border-bottom">{data.name}</h3>
      <p class="w3-padding-16">{data.description}</p>
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
