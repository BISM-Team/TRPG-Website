<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import { stringify } from "devalue";
  import { invalidateAll } from "$app/navigation";
  import type { CardData, Dashboard, NumericVariable, StringVariable } from "@prisma/client";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let dashboard: Dashboard & {
    cards: (CardData & { mod_properties: any }) [],
    stringVariables: StringVariable[],
    numericVariables: NumericVariable[]
  };
  export let disable: boolean;
  export let edit: boolean;
  export let edited: boolean;
  export let removedCards: string[];
  export let removedNumVar: string[] = [];
  export let removedStrVar: string[] = [];
  let showSaveDialog = false;

  export function toggleEdit() {
    if(edit && edited) {
      showSaveDialog=true;
    } else edit=!edit;
  }

  function toggleSaveDialog() {
    showSaveDialog=!showSaveDialog;
  }

  export const submitSave: SubmitFunction = async function(request) {
    disable=true;

    request.formData.set("cards", stringify(dashboard.cards.map((card, index) => { card.index=index; const {mod_properties, ...other_card} = card; return other_card;})));
    request.formData.set("numVars", stringify(dashboard.numericVariables));
    request.formData.set("strVars", stringify(dashboard.stringVariables));
    request.formData.set("removedCards", stringify(removedCards));
    request.formData.set("removedNumVar", stringify(removedNumVar));
    request.formData.set("removedStrVar", stringify(removedStrVar));
    const save = request.formData.get("save")?.toString();
    const _switch = request.formData.get("switch")?.toString();

    if(save && save === "false") {
      request.cancel();
      await invalidateAll();
      showSaveDialog=false;
      edit=false;
      edited=false;
      disable=false;
    } else {
      return async ({ result, update }) => {
        await update({reset: false});
        if (result.type === "success") { 
          showSaveDialog=false;
          edited=false;
          removedCards = [];
          if(_switch && _switch==="true") edit=false;
        }
        disable=false;
      }
    }
  }
</script>

{#if showSaveDialog}
  <Modal {disable} on:close={toggleSaveDialog}>
    <h3 class="w3-padding">Do you want to save your changes?</h3>
    <form action="?/save" method="post" use:enhance={submitSave}>
      <input type="hidden" name="switch" value="true">
      <input type="hidden" name="dashboardId" id="dashboardIdInput" value={dashboard.id}/>
      <button disabled={disable} class="w3-button w3-margin w3-grey" name="save" value="false" type="submit">Discard</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" name="save" value="true" type="submit">Yes</button>
    </form>
  </Modal>
{/if}