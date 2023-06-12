<script lang="ts">
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let disabled: boolean;
  export let redirectUrl: string;
  let showRemoveDialog = false;
  
  export function toggle() {
    showRemoveDialog = !showRemoveDialog;
  }

  const submitRemove: SubmitFunction = function() {
    disabled = true;
    return async ({ result, update }) => {
      if (result.type === "success") { 
        await goto(redirectUrl);
        showRemoveDialog = false;
      } else {
        await update({ reset: false });
      }
      disabled = false;
    };
  }
</script>

{#if showRemoveDialog}
  <Modal {disabled} on:close={toggle}>
    <h4 class="w3-padding">Remove Character from Campaign</h4>
    <form action="?/remove" id="removeConfirmationButtons" class="w3-container" method="post" use:enhance={submitRemove}>
      <button {disabled} class="w3-button w3-margin w3-grey" type="button" on:click={toggle}>Cancel</button>
      <button {disabled} class="w3-button w3-margin w3-teal" type="submit">Remove</button>
    </form>
  </Modal>
{/if}