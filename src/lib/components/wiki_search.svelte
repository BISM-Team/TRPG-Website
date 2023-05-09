<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { TypedFetch } from "../../../$api";
  import type { TypedResponse } from "@sveltejs/kit";
  const dispatch = createEventDispatcher();

  export let campaignId: string;
  let searchText = "";
  let searchInput: HTMLElement;
  let initial_load = (async () => {
    return (await (await (fetch as typeof TypedFetch)(`/api/Campaign/${campaignId}/wiki`)).json()).pages;
  })();

  function close() {
    dispatch("close");
  }
</script>

<div id="container">
  <input class="w3-input" type="text" id="searchInput" autofocus bind:this={searchInput} bind:value={searchText}>
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