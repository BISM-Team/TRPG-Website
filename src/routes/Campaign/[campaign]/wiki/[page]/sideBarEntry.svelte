<script lang="ts">
  import { capitalizeFirstLetter } from "$lib/utils";

  export let node: PrismaJson.WikiTreeNode;
  let expanded = false;
</script>

{#if node.name.toLowerCase().trim() !== "unsorted" || node.children.length}
  <div class="entryContainer">
    <div class="w3-button entry">
      {#if node.children.length}
      <button class="w3-button expand" on:click={() => { expanded=!expanded }}>
          <span class="material-symbols-outlined" style:display="block">
            {expanded ? "arrow_drop_down" : "arrow_right"}
          </span>
      </button>
      {/if}
      <div class="page_name" style:padding-left="{node.children.length ? 0 : 0.7}em">
        {#if node.name.toLowerCase().trim() !== "unsorted"}
          <a class="page_name" href="{node.name}">{capitalizeFirstLetter(node.name)}</a>
        {:else}
          <div class="page_name">{capitalizeFirstLetter(node.name)}</div>
        {/if}
      </div>
    </div>
    {#if node.children.length}
      <div class="dropdown" style:display={expanded ? "block" : "none"}>
        {#each node.children as child}
          <svelte:self node={child}/>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .entryContainer {
    padding-left: 0.7em;
  }

  .entry {
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    align-items: center;
    margin: 0;
    font-size: medium;
  }

  .expand {
    min-width: 2em;
    display: block;
  }

  .page_name {
    margin: 0;
    width: 100%;
    text-align: left;
  }

  .page_name > a {
    display: block;
    width: 100%;
  }

  button {
    padding: 0;
  }

  a {
    text-decoration: none;
  }
</style>