<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance, type SubmitFunction } from "$app/forms";
  import type { ActionData, PageData } from "./$types";
  import type { CardData } from "@prisma/client";

  export let data: PageData;
  export let disable: boolean;
  export let edited: boolean;
  let showCreateDialog = false;

  export function toggle() {
    showCreateDialog = !showCreateDialog;
  }

  const submitCreateCard: SubmitFunction = async function (request) {
    disable = true;
    request.cancel();

    const width = request.data.get("width")?.toString();
    const height = request.data.get("height")?.toString();
    const zoom = request.data.get("zoom")?.toString();
    const source = request.data.get("source")?.toString();
    const type = request.data.get("type")?.toString();
    const dashboardId = request.data.get("dashboardId")?.toString();

    if (!width || !height || !zoom || !source || !type || !dashboardId) {
      disable = false;
      return;
    }

    let randomId = crypto.randomUUID();
    while(data.dashboard.cards.findIndex((card) => card.id===randomId) !== -1) 
      randomId = crypto.randomUUID();

    const card: CardData = {
      id: randomId,
      index: data.dashboard.cards.length,
      width: parseInt(width),
      height: parseInt(height),
      zoom: parseInt(zoom),
      source: source,
      type: type,
      dashboardId: dashboardId,
      templateId: null
    };
    edited = true;
    data.dashboard.cards.push(card);
    data.dashboard.cards = data.dashboard.cards;
    showCreateDialog = false;
    disable = false;
  };
</script>

{#if showCreateDialog}
  <Modal {disable} on:close={toggle}>
    <h3 class="w3-center">Create Card</h3>
    <form method="post" use:enhance={submitCreateCard}>
      <label for="heightInput">Height (px)</label>
      <input type="number" name="height" id="heightInput" class="w3-input w3-border w3-margin-bottom" value={200} />
      
      <label for="widthInput">Width (px)</label>
      <input type="number" name="width" id="widthInput" class="w3-input w3-border w3-margin-bottom" value={200} />
      
      <input type="hidden" name="zoom" id="nameInput" value={1} class="w3-input w3-border w3-margin-bottom"/>
      
      <label for="sourceInput">Source</label>
      <input type="text" name="source" id="sourceInput" class="w3-input w3-border w3-margin-bottom" value={""}/>
      
      <label for="typeInput">Type</label>
      <input type="text" name="type" id="typeInput" class="w3-input w3-border w3-margin-bottom" value={"text"}/>
      
      <input type="hidden" name="dashboardId" class="w3-input w3-border w3-margin-bottom" value={data.dashboard.id}/>
      
      <button disabled={disable} type="button" on:click={toggle} class="w3-margin-top w3-button">Cancel</button>
      <button disabled={disable} type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
    </form>
  </Modal>
{/if}