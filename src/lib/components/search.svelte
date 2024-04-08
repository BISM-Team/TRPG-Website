<script lang="ts">
  import ErrorBar from './error_bar.svelte';

  export let fetch_function: () => Promise<({ name: string } & Record<string, any>)[]>;
  let searchText = '';
  let initial_load = fetch_function();
</script>

<div id="container">
  <!-- svelte-ignore a11y-autofocus -->
  <input class="input" type="text" id="searchInput" autofocus bind:value={searchText} />
  {#await initial_load}
    <p>Loading...</p>
  {:then results}
    <ul class="w3-ul">
      {#key searchText}
        <slot
          name="results"
          results={results.filter((entry) =>
            entry.name.toLowerCase().includes(searchText.trim().toLowerCase())
          )}
        />

        {#if results.findIndex((entry) => entry.name.toLowerCase() === searchText
              .trim()
              .toLowerCase()) === -1 && searchText}
          <slot name="not_found" {searchText} />
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
