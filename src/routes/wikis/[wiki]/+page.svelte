<script lang="ts">
  import Card from '$lib/components/card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1 class="my-xxl h1 mx-auto w-fit">{data.wiki.name}</h1>

<div class="my-xxl mx-auto w-fit">
  <Card
    links={[
      {
        href: '/wikis/' + data.params.wiki + '/pages/index',
        icon_name: 'play_arrow'
      }
    ]}>Index</Card
  >
</div>
