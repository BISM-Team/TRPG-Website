<script lang="ts">
  import Card from '$lib/components/card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: defaultDashboardId =
    data.character.Dashboard_Character.find((dashboard_character) => dashboard_character.default)
      ?.dashboardId ?? 'empty';
</script>

<h1 class="my-xxl h1 mx-auto w-min">{data.character.name}</h1>

<div class="my-xxl mx-auto w-min">
  <Card link="/characters/{data.params.character}/dashboards/{defaultDashboardId}">Dashboard</Card>
</div>
