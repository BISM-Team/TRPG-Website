<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import type { CardData, Dashboard, NumericVariable, StringVariable, CardType } from "@prisma/client";
  import { createId } from "@paralleldrive/cuid2"
  import { capitalizeFirstLetter, replaceCardSource } from "$lib/utils";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { map } from "./Cards/cards_map";

  export let dashboard: Dashboard & {
    cards: (CardData & { mod_properties: Record<string, any> }) [],
    stringVariables: StringVariable[],
    numericVariables: NumericVariable[]
  };
  export let dashboardId: string;
  export let disable: boolean;
  export let edited: boolean;
  let showCreateDialog = false;
  let selected_type: CardType = "text";

  export function toggle() {
    showCreateDialog = !showCreateDialog;
  }

  const type_options = Object.keys(map) as CardType[];

  const submitCreateCard: SubmitFunction = async function (request) {
    disable = true;
    request.cancel();

    const width = request.formData.get("width")?.toString() ?? '200';
    const height = request.formData.get("height")?.toString() ?? '200';

    const card: CardData = {
      id: createId(),
      index: dashboard.cards.length,
      width: parseInt(width),
      height: parseInt(height),
      properties: {},
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
      <select name="type" id="typeInput" class="w3-input w3-border w3-margin-bottom" bind:value={selected_type} required>
        {#each type_options as type}
          <option value={type}>{capitalizeFirstLetter(type)}</option>
        {/each}
      </select>
            
      <button disabled={disable} type="button" on:click={toggle} class="w3-margin-top w3-button">Cancel</button>
      <button disabled={disable} type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
    </form>
  </Modal>
{/if}