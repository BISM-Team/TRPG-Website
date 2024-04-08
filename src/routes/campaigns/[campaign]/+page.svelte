<script lang="ts">
  import Card from '$lib/components/card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: defaultDashboardId =
    data.campaign.Dashboard_Campaign.find((dashboard_campaign) => dashboard_campaign.default)
      ?.dashboardId ?? 'empty';
</script>

<h2 class="h2">{data.campaign.name}</h2>

<div class="dashboard-link">
  <Card link="/campaigns/{data.params.campaign}/dashboards/{defaultDashboardId}">Dashboard</Card>
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
