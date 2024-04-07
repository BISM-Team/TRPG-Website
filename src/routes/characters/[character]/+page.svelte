<script lang="ts">
  import Card from '$lib/components/card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: defaultDashboardId =
    data.character.Dashboard_Character.find((dashboard_character) => dashboard_character.default)
      ?.dashboardId ?? 'empty';
</script>

<h2 class="h2">{data.character.name}</h2>

<div class="dashboard-link">
  <Card link="/characters/{data.params.character}/dashboards/{defaultDashboardId}">Dashboard</Card>
</div>

<style>
  h2 {
    margin: 2em auto;
    width: min-content;
  }

  .dashboard-link {
    margin: 2em auto;
    width: min-content;
  }
</style>
