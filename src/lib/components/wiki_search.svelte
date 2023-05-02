<script lang="ts">
  import type { Page } from "@prisma/client"
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let campaignId: string;
  let searchText: string = "";

  function close() {
    dispatch("close");
  }

  const initial_load: Promise<Page[]> = (async () => {
    return await (await fetch("/api/Campaign/"+campaignId+"/wiki")).json();
  })();
</script>

<div id="container">
  <input type="text" id="searchInput" bind:value={searchText}>
  {#await initial_load}
    <p>Loading...</p>
  {:then results} 
    <ul>
      {#key searchText}
        {#each results.filter((page) => page.name.toLowerCase().includes(searchText.trim().toLowerCase())) as page}
          <li>
            <a href={"./"+page.name} on:click={close}>{page.name}</a>
          </li>
        {/each}
        {#if results.findIndex((page) => page.name.toLowerCase()===searchText.trim().toLowerCase()) === -1 && searchText}
          <li>
            <a data-sveltekit-preload-data="off" data-sveltekit-preload-code="hover" href={"./"+searchText.trim()} on:click={close} class="w3-text-gray">{searchText.trim()}</a>
          </li>
        {/if}
      {/key}
    </ul>
  {:catch}
    <p class="w3-panel w3-red w3-block">Could not load data from server, please try again.</p>
  {/await}
</div>