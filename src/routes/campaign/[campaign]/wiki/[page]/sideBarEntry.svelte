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
      <div class="page_name">
        {#if node.name.toLowerCase().trim() !== "unsorted"}
          <a href="{node.name}" style:padding-left="{node.children.length ? 0 : 1.0}em">{capitalizeFirstLetter(node.name)}</a>
        {:else}
          <div>{capitalizeFirstLetter(node.name)}</div>
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
    font-size: medium;
    margin: 0;
    padding: 0;
  }

  .expand {
    min-width: calc(24px + 1em);
    padding: 0.7em 0.5em;
    display: block;
  }

  .page_name {
    margin: 0;
    width: 100%;
    text-align: left;
  }

  .page_name > * {
    display: block;
    width: 100%;
    padding: 0.7em 2em;
    padding-left: 0;
  }

  button {
    padding: 0;
  }

  a {
    text-decoration: none;
  }
</style>