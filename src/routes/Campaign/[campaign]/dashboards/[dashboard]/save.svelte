<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance, type SubmitFunction } from "$app/forms";
  import type { ActionData, PageData } from "./$types";
  import { stringify } from "devalue";
  import { invalidateAll } from "$app/navigation";
  import ErrorBar from "$lib/components/error_bar.svelte";

  export let data: PageData;
  export let disable: boolean;
  export let edit: boolean;
  export let edited: boolean;
  export let removed: string[];
  export let form: ActionData;
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

    request.data.set("cards", stringify(data.dashboard.cards.map((card, index) => { card.index=index; return card; })));
    request.data.set("removed", stringify(removed));
    const save = request.data.get("save")?.toString();
    const _switch = request.data.get("switch")?.toString();

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
      {#if form?.save_invalid_data}
        <ErrorBar text={'Client Error, please contact us!'}/>
      {:else if form?.server_error}
        <ErrorBar text={'Server Error, please contact us!'}/>
      {/if}
      <input type="hidden" name="switch" value="true">
      <button disabled={disable} class="w3-button w3-margin w3-grey" name="save" value="false" type="submit">Discard</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" name="save" value="true" type="submit">Yes</button>
    </form>
  </Modal>
{/if}