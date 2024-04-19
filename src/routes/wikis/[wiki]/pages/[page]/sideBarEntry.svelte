<script lang="ts">
  import { capitalizeFirstLetter } from '$lib/utils';

  export let node: PrismaJson.WikiTreeNode;
  let expanded = false;
</script>

{#if node.name.toLowerCase().trim() !== 'unsorted' || node.children.length}
  <div class="entryContainer">
    <div class="entry btn">
      <div class="page_name py-l px-m">
        {#if node.name.toLowerCase().trim() !== 'unsorted'}
          <a href={node.name}>{capitalizeFirstLetter(node.name)}</a>
        {:else}
          <div>{capitalizeFirstLetter(node.name)}</div>
        {/if}
      </div>
      {#if node.children.length}
        <button
          class="expand py-l pl-m pr-l btn"
          on:click={() => {
            expanded = !expanded;
          }}
        >
          <span class="material-symbols-outlined" style:display="block">
            {expanded ? 'arrow_drop_down' : 'arrow_right'}
          </span>
        </button>
      {/if}
    </div>
    {#if node.children.length}
      <div class="dropdown" style:display={expanded ? 'block' : 'none'}>
        {#each node.children as child}
          <svelte:self node={child} />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .entryContainer {
    padding-left: 0.7em;
  }

  .entry {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    font-size: medium;
    margin: 0;
    padding: 0;
  }

  .expand {
    display: block;
  }

  .page_name {
    text-align: left;
    width: 100%;
  }

  .page_name > * {
    display: block;
    width: 100%;
  }

  a {
    text-decoration: none;
  }
</style>
