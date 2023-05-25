<script lang="ts">
  import { propagateErrors } from "$lib/utils";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let campaignId: string;
  let searchText = "";
  let initial_load = (async () => {
    const response = await fetch(`/api/Campaign/${campaignId}/wiki`);
    await propagateErrors(response, new URL(window.location.href));
    if (response.ok) {
      return (await response.json()).pages;
    } else throw new Error("unexpected branch");
  })();

  function close() {
    dispatch("close");
  }
</script>

<div id="container">
  <input class="w3-input" type="text" id="searchInput" autofocus bind:value={searchText}>
  {#await initial_load}
    <p>Loading...</p>
  {:then results} 
    <ul class="w3-ul">
      {#key searchText}
        {#each results.filter((page) => page.name.toLowerCase().includes(searchText.trim().toLowerCase())) as page}
          <a href={"./"+page.name} on:click={close}>
            <li>{page.name}</li>
          </a>
        {/each}
        {#if results.findIndex((page) => page.name.toLowerCase()===searchText.trim().toLowerCase()) === -1 && searchText}
        <a data-sveltekit-preload-data="off" data-sveltekit-preload-code="hover" href={"./"+searchText.trim()} on:click={close} class="w3-text-gray">
          <li>
            {searchText.trim()}
          </li>
        </a>
        {/if}
      {/key}
    </ul>
  {:catch}
    <p class="w3-panel w3-red w3-block">Could not load data from server, please try again.</p>
  {/await}
</div>

<style>
  input {
    margin-bottom: 1em;
  }

  a {
    display: block;
    text-decoration: none;
    border-bottom: 1px grey;
  }
</style>