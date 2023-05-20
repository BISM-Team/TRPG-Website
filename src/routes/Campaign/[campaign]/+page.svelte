<script lang="ts">
    import type { PageData } from './$types';
    import Card from '$lib/components/card.svelte';    
    export let data: PageData;
</script>

<h2 class="w3-center">{data.params.campaign}</h2>

<div class="cards">
  <Card link={"./" + data.params.campaign + "/dashboards"}>
    <h3 class="w3-padding-32">Dashboards</h3>
  </Card>

  <Card link={"./" + data.params.campaign + "/wiki/index"}>
    <h3 class="w3-padding-32">Wiki</h3>
  </Card>
</div>