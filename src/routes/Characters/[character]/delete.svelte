<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance, type SubmitFunction } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { ActionData, PageData } from "./$types";
  import ErrorBar from "$lib/components/error_bar.svelte";

  export let data: PageData;
  export let form: ActionData;
  export let disable: boolean;
  export let edit: boolean;
  let showDeleteDialog = false;
  
  export function toggle() {
    showDeleteDialog = !showDeleteDialog;
  }

  const submitDelete: SubmitFunction = function() {
    disable = true;
    return async ({ result, update }) => {
      if (result.type === "success") { 
        await goto(`/Campaign/${data.params.campaign}/dashboards`);
        showDeleteDialog = false;
        edit = false; 
      } else {
        await update({ reset: false });
      }
      disable = false;
    };
  }
</script>

{#if showDeleteDialog}
  <Modal {disable} on:close={toggle}>
    <h4 class="w3-padding">Do you want to delete this dashboard?</h4>
    <form action="?/delete" id="deleteConfirmationButtons" class="w3-container" method="post" use:enhance={submitDelete}>
      {#if form?.server_error}
        <ErrorBar text={'Server Error, please contact us!'}/>
      {/if}
      <button disabled={disable} class="w3-button w3-margin w3-grey" type="button" on:click={toggle}>Cancel</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" type="submit">Yes</button>
    </form>
  </Modal>
{/if}