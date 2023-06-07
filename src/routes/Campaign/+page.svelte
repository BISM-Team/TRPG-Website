<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import Card from "$lib/components/card.svelte";
  import Modal from "$lib/components/modal.svelte";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let data: PageData;
  export let form: ActionData;
  let show_modal = false;
  let disable = false;

  function toggleCreateDialog() {
    show_modal = !show_modal;
  }

  const submitCreate: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") toggleCreateDialog();
      disable = false;
    };
  };
</script>

{#if show_modal}
  <Modal {disable} on:close={toggleCreateDialog}>
    <form action="?/create" method="post" use:enhance={submitCreate}>
      <label for="nameInput">Name</label>
      <input type="text" name="name" id="nameInput" class="w3-input w3-border w3-margin-bottom" value={form?.name || ""}/>

      <button disabled={disable} type="button" on:click={toggleCreateDialog} class="w3-margin-top w3-button">Cancel</button>
      <button disabled={disable} type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
    </form>
  </Modal>
{/if}

<div class="cards">
  {#each data.campaigns as campaign}
    <Card link={"./campaign/" + campaign.id}>
      <h3 class="w3-padding-32">{campaign.name}</h3>
    </Card>
  {/each}

  <Card on:buttonClick={toggleCreateDialog}>
    <h3 class="w3-padding-32">Create a campaign</h3>
  </Card>
</div>

<style>
</style>
