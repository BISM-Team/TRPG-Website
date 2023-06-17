<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let dashboardId: string;
  export let disabled: boolean;
  export let edit: boolean;
  export let message: string;
  export let redirectUrl: string;
  let showDeleteDialog = false;
  
  export function toggle() {
    showDeleteDialog = !showDeleteDialog;
  }

  const submitDelete: SubmitFunction = function() {
    disabled = true;
    return async ({ result, update }) => {
      if (result.type === "success") { 
        await goto(redirectUrl);
        showDeleteDialog = false;
        edit = false; 
      } else {
        await update({ reset: false });
      }
      disabled = false;
    };
  }
</script>

{#if showDeleteDialog}
  <Modal {disabled} on:close={toggle}>
    <h4 class="h4 w3-padding">{message}</h4>
    <form action="?/delete" id="deleteConfirmationButtons" class="w3-container" method="post" use:enhance={submitDelete}>
      <input type="hidden" name="dashboardId" id="dashboardIdInput" value={dashboardId} class="input"/>

      <button {disabled} class="w3-margin btn-secondary" type="button" on:click={toggle}>Cancel</button>
      <button {disabled} class="w3-margin btn-primary" type="submit">Yes</button>
    </form>
  </Modal>
{/if}