<script lang="ts">
  import { page } from "$app/stores";
  import { propagateErrors } from "$lib/utils";
  import type { Character, Dashboard } from "@prisma/client";

  export let source: string;
  export let dashboard: Dashboard & { 
    character: Character | null 
  };

  let data: ReturnType<typeof loadData>;
  $: data = loadData(source);

  async function loadData(source: string) {
    let response;
    let prop;
    if(dashboard.character) {
      prop = source;
      response = await fetch(`/api/characters/${dashboard.character.id}`);
    } else {
      const index = source.indexOf(".");
      const id = source.slice(0, index);
      prop = source.slice(index+1);
      response = await fetch(`/api/characters/${id}`);
    }
    await propagateErrors(response, $page.url);
    if(!response.ok) throw new Error("unexpected error");
    const character = (await response.json()).character;
    return character.properties[prop];
  }
</script>

<div class="content w3-card-4">
  {#await data}
    <p>loading data...</p>
  {:then data} 
    {#if data}
      <p class="text-center" title={source}>{data}</p>
    {:else}
      <p class="text-center">Property not found</p>
    {/if}
  {/await}
</div>

<style lang="postcss">

  .content {
    padding: 2vh 2vw;
    overflow: auto;
    background-color: white;
    width: 100%;
    height: 100%;
  }
</style>