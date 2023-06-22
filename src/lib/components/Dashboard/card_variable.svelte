<script lang="ts">
  import { capitalizeFirstLetter } from "$lib/utils";
  import type { CardType } from "@prisma/client";

  export let key: string;
  export let selected_type: CardType;
  export let props: any;
  export let defaultProps: any;
</script>

<label class="label" for="field_{key}Input">{capitalizeFirstLetter(key)}</label>
{#if typeof (defaultProps[key] ?? defaultProps[0]) === "string"}
  <input id="field_{key}Input" class="input" type="text" bind:value={props[key]} required/>
{:else if typeof (defaultProps[key] ?? defaultProps[0]) === "number"}
  <input id="field_{key}Input" class="input" type="number" bind:value={props[key]} required/>
{:else if typeof (defaultProps[key] ?? defaultProps[0]) === "boolean"}
  <input id="field_{key}Input" class="checkbox" type="checkbox" bind:checked={props[key]}/>
{:else if typeof (defaultProps[key] ?? defaultProps[0]) === "object"}
  {#if (defaultProps[key] ?? defaultProps[0]).type === "enum"}
  <select id="field_{key}Input" class="select" bind:value={props[key]} required>
    {#each Object.keys((defaultProps[key] ?? defaultProps[0]).enum) as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  {:else}
    <div class="m-4 py-2 px-4 w3-border">
      {#each Object.keys(props[key]) as _key, index}
        <div class="nested_field">
          {#if Array.isArray(props[key])}
            <button type="button" class="btn m-auto" on:click={() => { props[key] = props[key].toSpliced(index, 1) }}><span class="material-symbols-outlined">Remove</span></button>
          {/if}
          <svelte:self key={_key} {selected_type} props={props[key]} defaultProps={(defaultProps[key] ?? defaultProps[0])}/>
        </div>
      {/each}
      {#if Array.isArray(props[key])}
        <button type="button" class="btn m-auto" on:click={() => { props[key][props[key].length] = JSON.parse(JSON.stringify(defaultProps[key][0])) }}><span class="material-symbols-outlined">Add</span></button>
      {/if}
    </div>
  {/if}
{:else}
  <p>Invalid prop {key}.</p>
{/if}