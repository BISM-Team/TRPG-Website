<script lang="ts">
  import { propagateErrors } from '$lib/utils';
  import { createEventDispatcher } from 'svelte';
  import ErrorBar from './error_bar.svelte';
  import type { fetch as kit_fetch } from '@sveltejs/kit';
  const dispatch = createEventDispatcher();

  export let wikiId: string;
  let searchText = '';
  let initial_load = (async () => {
    const response = await (fetch as typeof kit_fetch)(`/api/wikis/${wikiId}/search`);
    await propagateErrors(response, new URL(window.location.href));
    if (response.ok) {
      return (await response.json()).pages;
    } else throw new Error('unexpected branch');
  })();

  function close() {
    dispatch('close');
  }
</script>

<div id="container">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input" type="text" id="searchInput" autofocus bind:value={searchText} />
  {#await initial_load}
    <p>Loading...</p>
  {:then results}
    <ul class="w3-ul">
      {#key searchText}
        {#each results.filter((page) => page
            .toLowerCase()
            .includes(searchText.trim().toLowerCase())) as page}
          <a href={'./' + page} on:click={close}>
            <li>{page}</li>
          </a>
        {/each}
        {#if results.findIndex((page) => page.toLowerCase() === searchText
              .trim()
              .toLowerCase()) === -1 && searchText}
          <a
            data-sveltekit-preload-data="off"
            data-sveltekit-preload-code="hover"
            href={'./' + searchText.trim()}
            on:click={close}
            class="text-gray"
          >
            <li>
              {searchText.trim()}
            </li>
          </a>
        {/if}
      {/key}
    </ul>
  {:catch}
    <ErrorBar text="Could not load data from server, please try again." />
  {/await}
</div>

<style lang="postcss">
  input {
    margin-bottom: 1em;
  }

  a {
    display: block;
    text-decoration: none;
    border-bottom: 1px grey;
  }
</style>
