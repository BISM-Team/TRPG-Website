<script lang="ts">
  import type { PageData } from './$types';
  import Card from '$lib/components/card.svelte';
  export let data: PageData;
</script>

<h2 class="h2 p-1 text-center">{data.campaign.name}</h2>

<div class="cards">
  {#each data.campaign.Dashboard_Campaign as dashboard_campaign}
    <Card
      link={'/campaigns/' + data.params.campaign + '/dashboards/' + dashboard_campaign.dashboardId}
      ><h3>{dashboard_campaign.dashboard.name}</h3></Card
    >
  {/each}
</div>
