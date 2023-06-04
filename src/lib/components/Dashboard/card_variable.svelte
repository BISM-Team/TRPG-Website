<script lang="ts">
  import { capitalizeFirstLetter } from "$lib/utils";
  import type { CardType } from "@prisma/client";

  export let key: string;
  export let selected_type: CardType;
  export let props: any;
</script>

<label for="{key}Input">{capitalizeFirstLetter(key)}</label>
{#if typeof props[key] === "string"}
  <input id="{key}Input" class="w3-input w3-border w3-margin-bottom" type="text" bind:value={props[key]} required/>
{:else if typeof props[key] === "number"}
  <input id="{key}Input" class="w3-input w3-border w3-margin-bottom" type="number" bind:value={props[key]} required/>
{:else if typeof props[key] === "boolean"}
  <input id="{key}Input" class="w3-check w3-margin-bottom" type="checkbox" style:position="static" bind:checked={props[key]}/>
{:else if typeof props[key] === "object"}
  <div class="nested">
    {#each Object.keys(props[key]) as _key, index}
      <div class="nested_field">
        {#if Array.isArray(props[key])}
          <button type="button" class="w3-button add_btn" on:click={() => { props[key] = props[key].toSpliced(index, 1) }}>Remove</button>
        {/if}
        <svelte:self key={_key} {selected_type} props={props[key]}/>
      </div>
    {/each}
    {#if Array.isArray(props[key])}
      <button type="button" class="w3-button add_btn" on:click={() => { props[key][props[key].length] = JSON.parse(JSON.stringify(props[key][props[key].length-1])) }}>Add</button>
    {/if}
  </div>
{:else}
  <p>Invalid prop {key}.</p>
{/if}

<style>
  .nested {
    margin: 1em 1em;
    border-left: 1px solid #ccc;
    padding: 0 1em;
  }
</style>