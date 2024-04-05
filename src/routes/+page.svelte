<script lang="ts">
  import Card from '$lib/components/card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div>
  <h2>Campaigns</h2>
  <div class="cards">
    {#await data.campaigns}
      <p>Loading...</p>
    {:then campaigns}
      {#each campaigns as campaign}
        <Card link={'/campaigns/' + campaign.id}>
          <svelte:fragment slot="card-header">
            <h3 class="h3 p-2 text-center">{campaign.name}</h3>
          </svelte:fragment>
        </Card>
      {:else}
        {#if data.auth}
          <p>Please login to view and create your campaigns</p>
        {:else}
          <p>No campaigns yet! Create or participate in a campaign</p>
        {/if}
      {/each}
    {/await}
  </div>
</div>

<div>
  <h2>Characters</h2>
  <div class="cards">
    {#await data.characters}
      <p>Loading...</p>
    {:then characters}
      {#each characters as character}
        <Card link={'/characters/' + character.id}>
          <svelte:fragment slot="card-header">
            <h3 class="h3 p-2 text-center">{character.name}</h3>
          </svelte:fragment>
        </Card>
      {:else}
        {#if data.auth}
          <p>Please login to view and create your characters</p>
        {:else}
          <p>No characters yet! Create one</p>
        {/if}
      {/each}
    {/await}
  </div>
</div>

<div>
  <h2>Wikis</h2>
  <div class="cards">
    {#await data.wikis}
      <p>Loading...</p>
    {:then wikis}
      {#each wikis as wiki}
        <Card link={'/wikis/' + wiki.id}>
          <svelte:fragment slot="card-header">
            <h3 class="h3 p-2 text-center">{wiki.name}</h3>
          </svelte:fragment>
        </Card>
      {:else}
        {#if data.auth}
          <p>Please login to view and create your wikis</p>
        {:else}
          <p>No wikis yet! Create or participate in a wiki</p>
        {/if}
      {/each}
    {/await}
  </div>
</div>

<style lang="postcss">
  h3 {
    margin: 0;
  }
  p {
    line-height: 1.5em;
  }
</style>
