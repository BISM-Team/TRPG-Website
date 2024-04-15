<script lang="ts">
  import Modal from '$lib/components/modal.svelte';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { SubmitFunction } from '@sveltejs/kit';

  export let disabled: boolean;
  export let redirectUrl: string;
  let showRemoveDialog = false;

  export function toggle() {
    showRemoveDialog = !showRemoveDialog;
  }

  const submitRemove: SubmitFunction = function () {
    disabled = true;
    return async ({ result, update }) => {
      if (result.type === 'success') {
        await goto(redirectUrl);
        showRemoveDialog = false;
      } else {
        await update({ reset: false });
      }
      disabled = false;
    };
  };
</script>

{#if showRemoveDialog}
  <Modal {disabled} on:close={toggle}>
    <h4 class="w3-padding h4">Remove Character from Campaign</h4>
    <form
      action="?/remove"
      id="removeConfirmationButtons"
      class="w3-container"
      method="post"
      use:enhance={submitRemove}
    >
      <button {disabled} type="button" class="btn-secondary btn" on:click={toggle}>Cancel</button>
      <button {disabled} type="submit" class="btn-primary btn">Remove</button>
    </form>
  </Modal>
{/if}
