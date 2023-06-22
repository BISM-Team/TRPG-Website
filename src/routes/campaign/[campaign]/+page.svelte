<script lang="ts">
    import type { PageData } from './$types';
    import Card from '$lib/components/card.svelte';    
    export let data: PageData;
</script>

<h2 class="h2 text-center p-1">{data.campaign.name}</h2>

<div class="cards">
  <Card link="./{data.params.campaign}/characters">
    <h3 class="h3 p-2">Characters</h3>
  </Card>

  <Card link="./{data.params.campaign}/dashboards">
    <h3 class="h3 p-2">Dashboards</h3>
  </Card>

  <Card link="./{data.params.campaign}/wiki/index">
    <h3 class="h3 p-2">Wiki</h3>
  </Card>
</div>