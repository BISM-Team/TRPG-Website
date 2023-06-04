<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import type { CardData, Dashboard, NumericVariable, StringVariable, CardType } from "@prisma/client";
  import { capitalizeFirstLetter, replaceCardSource } from "$lib/utils";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { map } from "./Cards/cards_map";
  import CardVariable from "./card_variable.svelte";

  export let dashboard: Dashboard & {
    cards: (CardData & { mod_properties: any }) [],
    stringVariables: StringVariable[],
    numericVariables: NumericVariable[]
  };
  export let disable: boolean;
  export let edited: boolean;
  export let card: CardData;
  let showSettingsDialog = false;

  const type_options = Object.keys(map) as CardType[];
  let selected_type: CardType = card.type;
  let props: any;
  onChangeType();

  function onChangeType() {
    props = card.type === selected_type ? card.properties : map[selected_type].props
  }

  export function toggle() {
    showSettingsDialog = !showSettingsDialog;
  }

  const submitSettings: SubmitFunction = async function (request) {
    disable = true;
    request.cancel();
    const index = dashboard.cards.findIndex(_card => _card.id === card.id);
    if(index === -1) throw new Error("Card not found.");

    card.type = selected_type;
    card.properties = JSON.parse(JSON.stringify(props));
    dashboard.cards[index] = replaceCardSource(card, dashboard);
    edited = true;
    showSettingsDialog = false;
    disable = false;
  };
</script>

{#if showSettingsDialog}
  <Modal {disable} on:close={toggle}>
    <h3 class="w3-center">Card Settings</h3>
    <form method="post" use:enhance={submitSettings}>
      <label for="typeInput">Type</label>
      <select id="typeInput" class="w3-input w3-border w3-margin-bottom" bind:value={selected_type} on:change={onChangeType} required>
        {#each type_options as type}
          <option value={type}>{capitalizeFirstLetter(type)}</option>
        {/each}
      </select>

      {#each Object.keys(map[selected_type].props) as key}
        <CardVariable {key} {selected_type} bind:props={props}/>
      {/each}
            
      <button disabled={disable} type="button" on:click={toggle} class="w3-margin-top w3-button">Cancel</button>
      <button disabled={disable} type="submit" class="w3-margin-top w3-button w3-teal">Done</button>
    </form>
  </Modal>
{/if}