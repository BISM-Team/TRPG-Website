<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import type { CardData, Dashboard, NumericVariable, StringVariable, CardType } from "@prisma/client";
  import { createId } from "@paralleldrive/cuid2"
  import { capitalizeFirstLetter, replaceCardSource } from "$lib/utils";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { map } from "./Cards/cards_map";

  export let dashboard: Dashboard & {
    cards: (CardData & { mod_properties: any }) [],
    stringVariables: StringVariable[],
    numericVariables: NumericVariable[]
  };
  export let dashboardId: string;
  export let disable: boolean;
  export let edited: boolean;
  let showCreateDialog = false;

  const type_options = Object.keys(map) as CardType[];
  let selected_type: CardType = type_options[0];
  let props: any = {};

  export function toggle() {
    showCreateDialog = !showCreateDialog;
  }

  function resetProps() {
    props = {};
  }


  const submitCreateCard: SubmitFunction = async function (request) {
    disable = true;
    request.cancel();

    const width = request.formData.get("width")?.toString() ?? '200';
    const height = request.formData.get("height")?.toString() ?? '200';

    console.log(props);
    const card: CardData = {
      id: createId(),
      index: dashboard.cards.length,
      width: parseInt(width),
      height: parseInt(height),
      properties: props,
      type: selected_type,
      dashboardId: dashboardId,
      templateId: null
    };
    edited = true;
    dashboard.cards.push(replaceCardSource(card, dashboard));
    dashboard.cards = dashboard.cards;
    showCreateDialog = false;
    disable = false;
  };
</script>

{#if showCreateDialog}
  <Modal {disable} on:close={toggle}>
    <h3 class="w3-center">Create Card</h3>
    <form method="post" use:enhance={submitCreateCard}>
      <label for="typeInput">Type</label>
      <select id="typeInput" class="w3-input w3-border w3-margin-bottom" bind:value={selected_type} on:change={resetProps} required>
        {#each type_options as type}
          <option value={type}>{capitalizeFirstLetter(type)}</option>
        {/each}
      </select>

      {#each Object.keys(map[selected_type].props) as key}
        <label for="{key}Input">{capitalizeFirstLetter(key)}</label>
        {#if typeof map[selected_type].props[key] === "string"}
          <input id="{key}Input" class="w3-input w3-border w3-margin-bottom" type="text" bind:value={props[key]} required/>
        {:else if typeof map[selected_type].props[key] === "number"}
          <input id="{key}Input" class="w3-input w3-border w3-margin-bottom" type="number" bind:value={props[key]} required/>
        {:else if typeof map[selected_type].props[key] === "boolean"}
          <input id="{key}Input" class="w3-check w3-margin-bottom" type="checkbox" bind:checked={props[key]}/>
        {:else}
          <p>Invalid prop.</p>
        {/if}
      {/each}
            
      <button disabled={disable} type="button" on:click={toggle} class="w3-margin-top w3-button">Cancel</button>
      <button disabled={disable} type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
    </form>
  </Modal>
{/if}