<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import type { CardData, Dashboard, NumericVariable, StringVariable } from "@prisma/client";
  import { createId } from "@paralleldrive/cuid2"
  import { replaceCardSource } from "$lib/utils";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let dashboard: Dashboard & {
    cards: (CardData & { mod_source: string }) [],
    stringVariables: StringVariable[],
    numericVariables: NumericVariable[]
  };
  export let dashboardId: string;
  export let disable: boolean;
  export let edited: boolean;
  let showCreateDialog = false;

  export function toggle() {
    showCreateDialog = !showCreateDialog;
  }

  const submitCreateCard: SubmitFunction = async function (request) {
    disable = true;
    request.cancel();

    const width = request.formData.get("width")?.toString();
    const height = request.formData.get("height")?.toString();
    const zoom = request.formData.get("zoom")?.toString();
    const source = request.formData.get("source")?.toString();
    const type = request.formData.get("type")?.toString();

    if (!width || !height || !zoom || !source || !type) {
      disable = false;
      return;
    }

    const card: CardData = {
      id: createId(),
      index: dashboard.cards.length,
      width: parseInt(width),
      height: parseInt(height),
      zoom: parseInt(zoom),
      source: source,
      type: type,
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
      <label for="heightInput">Height (px)</label>
      <input type="number" name="height" id="heightInput" class="w3-input w3-border w3-margin-bottom" value={200} required/>
      
      <label for="widthInput">Width (px)</label>
      <input type="number" name="width" id="widthInput" class="w3-input w3-border w3-margin-bottom" value={200} required/>
      
      <input type="hidden" name="zoom" id="nameInput" value={1} class="w3-input w3-border w3-margin-bottom"/>

      <label for="sourceInput">Source</label>
      <input type="text" name="source" id="sourceInput" class="w3-input w3-border w3-margin-bottom" value={""} required/>
      
      <label for="typeInput">Type</label>
      <input type="text" name="type" id="typeInput" class="w3-input w3-border w3-margin-bottom" value={"text"} required/>
            
      <button disabled={disable} type="button" on:click={toggle} class="w3-margin-top w3-button">Cancel</button>
      <button disabled={disable} type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
    </form>
  </Modal>
{/if}