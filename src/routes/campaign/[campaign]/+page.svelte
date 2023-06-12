<script lang="ts">
    import type { PageData } from './$types';
    import Card from '$lib/components/card.svelte';    
    export let data: PageData;
</script>

<h2 class="w3-center w3-padding-16">{data.campaign.name}</h2>

<div class="cards">
  <Card link="./{data.params.campaign}/characters">
    <h3 class="w3-padding-32">Characters</h3>
  </Card>

  <Card link="./{data.params.campaign}/dashboards">
    <h3 class="w3-padding-32">Dashboards</h3>
  </Card>

  <Card link="./{data.params.campaign}/wiki/index">
    <h3 class="w3-padding-32">Wiki</h3>
  </Card>
</div>