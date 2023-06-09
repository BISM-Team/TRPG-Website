<script lang="ts">
  import { capitalizeFirstLetter } from "$lib/utils";
  import type { CardType } from "@prisma/client";

  export let key: string;
  export let selected_type: CardType;
  export let props: any;
  export let defaultProps: any;
</script>

<label for="field_{key}Input">{capitalizeFirstLetter(key)}</label>
{#if typeof (defaultProps[key] ?? defaultProps[0]) === "string"}
  <input id="field_{key}Input" class="w3-input w3-border w3-margin-bottom" type="text" bind:value={props[key]} required/>
{:else if typeof (defaultProps[key] ?? defaultProps[0]) === "number"}
  <input id="field_{key}Input" class="w3-input w3-border w3-margin-bottom" type="number" bind:value={props[key]} required/>
{:else if typeof (defaultProps[key] ?? defaultProps[0]) === "boolean"}
  <input id="field_{key}Input" class="w3-check w3-margin-bottom" type="checkbox" style:position="static" bind:checked={props[key]}/>
{:else if typeof (defaultProps[key] ?? defaultProps[0]) === "object"}
  {#if (defaultProps[key] ?? defaultProps[0]).type === "enum"}
  <select id="field_{key}Input" class="w3-select w3-border w3-margin-bottom" bind:value={props[key]} required>
    {#each Object.keys((defaultProps[key] ?? defaultProps[0]).enum) as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  {:else}
    <div class="nested">
      {#each Object.keys(props[key]) as _key, index}
        <div class="nested_field">
          {#if Array.isArray(props[key])}
            <button type="button" class="w3-button add_btn" on:click={() => { props[key] = props[key].toSpliced(index, 1) }}><span class="material-symbols-outlined" style:display="block">Remove</span></button>
          {/if}
          <svelte:self key={_key} {selected_type} props={props[key]} defaultProps={Array.isArray(defaultProps) ? defaultProps[0] : defaultProps[key]}/>
        </div>
      {/each}
      {#if Array.isArray(props[key])}
        <button type="button" class="w3-button add_btn" on:click={() => { props[key][props[key].length] = JSON.parse(JSON.stringify(defaultProps[key][0])) }}><span class="material-symbols-outlined" style:display="block">Add</span></button>
      {/if}
    </div>
  {/if}
{:else}
  <p>Invalid prop {key}.</p>
{/if}

<style>
  .nested {
    margin: 1em 1em;
    border: 1px solid #ccc;
    padding: 0.5em 1em;
  }

  .add_btn {
    margin: auto
  }

  .add_btn > span {
    margin: 0
  }
   
  .nested_field > :global(label) {
    margin-top: 0.5em;
  }

  input[type="checkbox"] {
    margin-top: 0.5em;
    margin-left: auto;
    margin-right: auto;
  }
</style>