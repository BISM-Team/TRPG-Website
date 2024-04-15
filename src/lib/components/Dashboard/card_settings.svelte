<script lang="ts">
  import Modal from '$lib/components/modal.svelte';
  import { enhance } from '$app/forms';
  import type {
    CardData,
    Dashboard,
    NumericVariable,
    StringVariable,
    CardType,
    Character
  } from '@prisma/client';
  import { capitalizeFirstLetter, replaceCardSource } from '$lib/utils';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { map } from './Cards/cards_map';
  import CardVariable from './card_variable.svelte';
  import type { Jsonify } from '@sveltejs/kit';

  export let dashboard: Jsonify<
    Dashboard & {
      cards: (CardData & { mod_properties: any })[];
      stringVariables: StringVariable[];
      numericVariables: NumericVariable[];
    }
  >;
  export let disabled: boolean;
  export let edited: boolean;
  export let card: CardData;
  let showSettingsDialog = false;

  const type_options = Object.keys(map) as CardType[];
  let selected_type: CardType = card.type;
  $: props = card.type === selected_type ? card.properties : map[selected_type].props;

  export function toggle() {
    showSettingsDialog = !showSettingsDialog;
  }

  const submitSettings: SubmitFunction = async function (request) {
    disabled = true;
    request.cancel();
    const index = dashboard.cards.findIndex((_card) => _card.id === card.id);
    if (index === -1) throw new Error('Card not found.');

    card.type = selected_type;
    card.properties = JSON.parse(JSON.stringify(props));
    dashboard.cards[index] = replaceCardSource(card, dashboard);
    edited = true;
    showSettingsDialog = false;
    disabled = false;
  };
</script>

{#if showSettingsDialog}
  <Modal {disabled} on:close={toggle}>
    <svelte:fragment slot="center-toolbar">
      <h3 class="h3 text-center">Card Settings</h3>
    </svelte:fragment>
    <form method="post" use:enhance={submitSettings}>
      <label class="label" for="typeInput">Type</label>
      <select
        id="typeInput"
        class="w3-border w3-margin-bottom select"
        bind:value={selected_type}
        required
      >
        {#each type_options as type}
          <option value={type}>{capitalizeFirstLetter(type)}</option>
        {/each}
      </select>

      {#each Object.keys(map[selected_type].props) as key}
        <CardVariable {key} {selected_type} bind:props defaultProps={map[selected_type].props} />
      {/each}

      <button {disabled} type="button" on:click={toggle} class="btn-secondary btn">Cancel</button>
      <button {disabled} type="submit" class="btn-primary btn">Done</button>
    </form>
  </Modal>
{/if}
