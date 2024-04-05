<script lang="ts">
  import Card from '$lib/components/card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h2>{data.character.name}</h2>

<div class="cards">
  {#each data.character.Dashboard_Character as dashboard_character}
    <Card
      link={'/characters/' +
        data.params.character +
        '/dashboards/' +
        dashboard_character.dashboardId}><h3>{dashboard_character.dashboard.name}</h3></Card
    >
  {/each}
</div>
