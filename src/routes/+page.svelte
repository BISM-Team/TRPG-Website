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
      <svelte:fragment slot="card-header">
        <h3 class="h3 text-center p-2">{data.name}</h3>
      </svelte:fragment>
      <p class="p-2">{data.description}</p>
    </Card>
  {/each}
</div>

<style lang="postcss">

  h3 {
    margin: 0;
  }
  p {
    line-height: 1.5em;
  }
</style>