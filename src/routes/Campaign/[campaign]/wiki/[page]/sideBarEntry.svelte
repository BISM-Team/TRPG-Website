<script lang="ts">
  import { capitalizeFirstLetter } from "$lib/utils";

  export let node: PrismaJson.WikiTreeNode;
  let expanded = false;
</script>

<div class="w3-button entry">
  <div class="expand">
    {#if node.children.length}
    <button class="w3-button placeholder" on:click={() => { expanded=!expanded }}>
        <span class="material-symbols-outlined" style:display="block">
          {expanded ? "arrow_drop_down" : "arrow_right"}
        </span>
    </button>
    {/if}
  </div>
  <div class="page_name">
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
      <svelte:self node={child} />
    {/each}
  </div>
{/if}

<style>
  .entry {
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    align-items: center;
    margin: 0;
    font-size: medium;
    padding-left: 0.5em;
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

  .dropdown > :global(*) {
    padding-left: 1.5em !important;
  }

</style>