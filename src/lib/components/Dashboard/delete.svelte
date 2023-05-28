<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let dashboardId: string;
  export let disable: boolean;
  export let edit: boolean;
  export let message: string;
  export let redirectUrl: string;
  let showDeleteDialog = false;
  
  export function toggle() {
    showDeleteDialog = !showDeleteDialog;
  }

  const submitDelete: SubmitFunction = function() {
    disable = true;
    return async ({ result, update }) => {
      if (result.type === "success") { 
        await goto(redirectUrl);
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
    <h4 class="w3-padding">{message}</h4>
    <form action="?/delete" id="deleteConfirmationButtons" class="w3-container" method="post" use:enhance={submitDelete}>
      <input type="hidden" name="dashboardId" id="dashboardIdInput" value={dashboardId}/>

      <button disabled={disable} class="w3-button w3-margin w3-grey" type="button" on:click={toggle}>Cancel</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" type="submit">Yes</button>
    </form>
  </Modal>
{/if}