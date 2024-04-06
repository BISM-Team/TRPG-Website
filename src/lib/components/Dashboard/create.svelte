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
  import { createId } from '@paralleldrive/cuid2';
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
  export let dashboardId: string;
  export let disabled: boolean;
  export let edited: boolean;
  let showCreateDialog = false;

  const type_options = Object.keys(map) as CardType[];
  let selected_type: CardType = type_options[0];
  let props: any;
  $: props = JSON.parse(JSON.stringify(map[selected_type].props));

  export function toggle() {
    showCreateDialog = !showCreateDialog;
  }

  const submitCreateCard: SubmitFunction = async function (request) {
    disabled = true;
    request.cancel();

    const width = request.formData.get('width')?.toString() ?? '30';
    const height = request.formData.get('height')?.toString() ?? '20';

    const card: CardData = {
      id: createId(),
      index: dashboard.cards.length,
      width: parseInt(width),
      height: parseInt(height),
      properties: JSON.parse(JSON.stringify(props)),
      type: selected_type,
      dashboardId: dashboardId,
      templateId: null
    };
    edited = true;
    dashboard.cards.push(replaceCardSource(card, dashboard));
    dashboard.cards = dashboard.cards;
    showCreateDialog = false;
    disabled = false;
  };
</script>

{#if showCreateDialog}
  <Modal {disabled} on:close={toggle}>
    <h3 class="h3 text-center">Create Card</h3>
    <form method="post" use:enhance={submitCreateCard}>
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

      <button {disabled} type="button" class="btn-secondary btn" on:click={toggle}>Cancel</button>
      <button {disabled} type="submit" class="btn-primary btn">Create</button>
    </form>
  </Modal>
{/if}
